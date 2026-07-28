(() => {
  'use strict'

  const selector = '.ascii-field canvas'
  const windowMs = 2_000
  const touchIntervalMs = 50
  const gestures = Object.freeze({
    idle: 'none',
    touch: 'horizontal',
    'vertical-pan': 'vertical',
  })
  const supported = new Set(PerformanceObserver?.supportedEntryTypes ?? [])
  const errors = []
  let longTaskObserver
  let longTasksSupported = false
  let running = false
  let state

  const reset = (mode) => {
    longTaskObserver?.takeRecords()
    state = {
      draws: [],
      endedAt: undefined,
      longTasks: [],
      mode,
      pointerTypes: new Set(),
      startedAt: performance.now(),
    }
  }
  const record = (list, value) => {
    list.push(value)
    if (list.length > 2_000) list.shift()
  }

  const nativeMatchMedia = window.matchMedia.bind(window)
  window.matchMedia = (query) => {
    const result = nativeMatchMedia(query)
    if (
      String(query).replace(/\s+/g, '').toLowerCase() !== '(pointer:coarse)'
    ) {
      return result
    }
    return new Proxy(result, {
      get(target, key) {
        if (key === 'matches') return true
        const value = Reflect.get(target, key, target)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  }

  const recordLongTask = (entry) => {
    record(state.longTasks, {
      duration: entry.duration,
      startTime: entry.startTime,
    })
  }
  if (supported.has('longtask')) {
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) recordLongTask(entry)
      })
      longTaskObserver.observe({ buffered: true, type: 'longtask' })
      longTasksSupported = true
    } catch {
      // Chrome advertised an observer it could not install.
    }
  }
  const flushLongTasks = async () => {
    await Promise.resolve()
    for (const entry of longTaskObserver?.takeRecords() ?? []) {
      recordLongTask(entry)
    }
    await Promise.resolve()
  }

  for (const type of ['pointerdown', 'pointermove']) {
    window.addEventListener(
      type,
      (event) => {
        const now = performance.now()
        if (
          now >= state.startedAt &&
          (state.endedAt === undefined || now < state.endedAt)
        ) {
          state.pointerTypes.add(event.pointerType || 'unknown')
        }
      },
      true
    )
  }
  window.addEventListener('error', (event) => {
    record(errors, { message: event.message, type: 'error' })
  })
  window.addEventListener('unhandledrejection', (event) => {
    record(errors, {
      message:
        event.reason instanceof Error
          ? `${event.reason.name}: ${event.reason.message}`
          : String(event.reason),
      type: 'unhandledrejection',
    })
  })

  const prototype = globalThis.CanvasRenderingContext2D?.prototype
  const nativeClearRect = prototype?.clearRect
  let hookInstalled = false
  if (prototype && nativeClearRect) {
    const benchmarkClearRect = function (...arguments_) {
      const measured =
        this.canvas instanceof HTMLCanvasElement &&
        this.canvas.matches(selector)
      const startedAt = measured ? performance.now() : 0
      const result = nativeClearRect.apply(this, arguments_)
      if (measured) {
        queueMicrotask(() => {
          const endedAt = performance.now()
          if (
            startedAt >= state.startedAt &&
            (state.endedAt === undefined || startedAt < state.endedAt)
          ) {
            record(state.draws, {
              duration: endedAt - startedAt,
              startTime: startedAt,
            })
          }
        })
      }
      return result
    }
    prototype.clearRect = benchmarkClearRect
    hookInstalled = prototype.clearRect === benchmarkClearRect
  }

  const overlaps = (left, right) =>
    left.startTime < right.startTime + right.duration &&
    right.startTime < left.startTime + left.duration
  const totalBlockingTime = (entries) =>
    entries.reduce(
      (sum, entry) => sum + Math.max(0, entry.duration - 50),
      0
    )

  const snapshot = () => {
    const elapsedMs = Math.max(state.endedAt - state.startedAt, 0.001)
    const measurement = {
      duration: elapsedMs,
      startTime: state.startedAt,
    }
    const draws = state.draws.filter(
      (entry) =>
        entry.startTime >= state.startedAt && entry.startTime < state.endedAt
    )
    const durationsMs = draws.map((entry) => entry.duration)
    const pageLongTasks = state.longTasks.filter((entry) =>
      overlaps(entry, measurement)
    )
    const longTasks = pageLongTasks.filter((task) =>
      draws.some((draw) => overlaps(task, draw))
    )
    return {
      canvas: [...document.querySelectorAll(selector)].map((canvas) => {
        const bounds = canvas.getBoundingClientRect()
        return {
          backingHeight: canvas.height,
          backingWidth: canvas.width,
          cssHeight: bounds.height,
          cssWidth: bounds.width,
          effectiveDprX: bounds.width ? canvas.width / bounds.width : 0,
          effectiveDprY: bounds.height ? canvas.height / bounds.height : 0,
        }
      }),
      draws: {
        count: draws.length,
        cpuPercent:
          (durationsMs.reduce((sum, duration) => sum + duration, 0) /
            elapsedMs) *
          100,
        durationsMs,
        intervalsMs: draws
          .slice(1)
          .map((draw, index) => draw.startTime - draws[index].startTime),
        perSecond: (draws.length * 1_000) / elapsedMs,
      },
      elapsedMs,
      errors: [...errors],
      gesture: gestures[state.mode],
      hookInstalled,
      longTasks: {
        count: longTasks.length,
        entries: longTasks,
        scope: 'ascii-draw-overlap',
        supported: longTasksSupported,
        tbtMs: totalBlockingTime(longTasks),
      },
      media: {
        coarsePointer: matchMedia('(pointer: coarse)').matches,
        dark: matchMedia('(prefers-color-scheme: dark)').matches,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      },
      pageLongTasks: {
        count: pageLongTasks.length,
        entries: pageLongTasks,
        scope: 'page',
        supported: longTasksSupported,
        tbtMs: totalBlockingTime(pageLongTasks),
      },
      pointerTypes: [...state.pointerTypes],
      source: state.mode === 'idle' ? 'idle' : 'synthetic-touch',
      windowMs,
    }
  }

  const startSyntheticTouch = (gesture) => {
    const canvas = document.querySelector(selector)
    if (!canvas) throw new Error('ASCII canvas missing')
    const surface =
      canvas.closest('[data-ascii-interaction-surface]') ||
      canvas.closest('.home-hero') ||
      canvas
    const box = canvas.getBoundingClientRect()
    let stopped = false
    let step = 0
    const emit = (type) => {
      const cycle = step % 62
      const progress = cycle <= 31 ? cycle / 31 : (62 - cycle) / 31
      const horizontal = gesture === 'horizontal'
      surface.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          clientX:
            box.left + box.width * (horizontal ? 0.15 + progress * 0.7 : 0.5),
          clientY:
            box.top + box.height * (horizontal ? 0.5 : 0.15 + progress * 0.7),
          isPrimary: true,
          pointerId: horizontal ? 73 : 74,
          pointerType: 'touch',
          pressure: type === 'pointerup' ? 0 : 0.5,
        })
      )
      step += 1
    }
    emit('pointerdown')
    const interval = setInterval(() => emit('pointermove'), touchIntervalMs)
    return () => {
      if (stopped) return
      stopped = true
      clearInterval(interval)
      emit('pointerup')
    }
  }

  const run = async (mode) => {
    if (!Object.hasOwn(gestures, mode)) {
      throw new Error(`Unknown ASCII benchmark mode: ${mode}`)
    }
    if (running) throw new Error('ASCII benchmark sample already running')
    running = true
    let stopTouch = () => {}
    try {
      reset(mode)
      if (mode !== 'idle') stopTouch = startSyntheticTouch(gestures[mode])
      await new Promise((done) => setTimeout(done, windowMs))
      state.endedAt = state.startedAt + windowMs
      stopTouch()
      await flushLongTasks()
      return snapshot()
    } finally {
      stopTouch()
      running = false
    }
  }

  reset('idle')
  Object.defineProperty(window, '__ASCII_BENCHMARK__', {
    configurable: true,
    value: Object.freeze({ hookInstalled, run, version: 3, windowMs }),
  })
})()
