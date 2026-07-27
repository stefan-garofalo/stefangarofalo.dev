'use client'

import { useEffect, useRef } from 'react'

const GLYPHS = ['/', '+', '*'] as const
const RIPPLE_FRAME_INTERVAL = 1000 / 30
const AMBIENT_FRAME_INTERVAL = 1000 / 9
const DAMPING = 0.96
const SETTLED_ENERGY = 0.003
const ASCII_INK = '#5e605b'
const BASE_GLYPH_SIZE = 10
const DISTURBANCE_RADIUS = 10
const DISTURBANCE_STRENGTH = 3.6
const MAX_DISTURBANCE = 8

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}

function hashGrid(x: number, y: number) {
  let hash = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
  return ((hash >>> 0) / 4294967295) * 2 - 1
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = smoothstep(x - x0)
  const ty = smoothstep(y - y0)
  const top =
    hashGrid(x0, y0) * (1 - tx) + hashGrid(x0 + 1, y0) * tx
  const bottom =
    hashGrid(x0, y0 + 1) * (1 - tx) +
    hashGrid(x0 + 1, y0 + 1) * tx

  return top * (1 - ty) + bottom * ty
}

function fbm(x: number, y: number) {
  let amplitude = 0.58
  let total = 0
  let normalizer = 0

  for (let octave = 0; octave < 4; octave += 1) {
    total += valueNoise(x, y) * amplitude
    normalizer += amplitude
    x = x * 2.03 + 13.1
    y = y * 1.97 - 7.7
    amplitude *= 0.5
  }

  return total / normalizer
}

function fillBaseField(
  field: Float32Array,
  columns: number,
  rows: number,
  phase: number
) {
  for (let row = 0; row < rows; row += 1) {
    const verticalPosition = row / Math.max(rows - 1, 1)
    const envelope = Math.max(0, 1 - Math.abs(verticalPosition - 0.54) * 2.15)

    for (let column = 0; column < columns; column += 1) {
      const domainWarp =
        Math.sin(column * 0.029 + row * 0.017 + phase * 0.52) * 4.2 +
        Math.sin(row * 0.041 - phase * 0.39) * 3.4
      const coherentNoise = fbm(
        (column + domainWarp * 4) * 0.085 + phase * 0.13,
        (row - domainWarp * 2.8) * 0.085 - phase * 0.095
      )
      const broadContour = Math.sin(
        column * 0.058 +
          row * 0.12 +
          domainWarp * 0.7 +
          coherentNoise * 3.4 +
          phase * 0.38
      )
      const crossingContour = Math.sin(
        column * 0.024 -
          row * 0.071 +
          coherentNoise * 4 -
          phase * 0.29
      )
      const value =
        0.5 +
        envelope * 0.025 +
        coherentNoise * 0.55 +
        broadContour * 0.2 +
        crossingContour * 0.16

      field[row * columns + column] = clamp(value, 0, 1)
    }
  }
}

function createBaseField(columns: number, rows: number, phase: number) {
  const field = new Float32Array(columns * rows)
  fillBaseField(field, columns, rows, phase)
  return field
}

function glyphFor(value: number) {
  if (value < 0.42) return GLYPHS[0]
  if (value < 0.62) return GLYPHS[1]
  return GLYPHS[2]
}

function glyphSizeFor(wave: number, slope: number) {
  const energy = Math.abs(wave) + slope * 0.2

  if (energy < 0.035) return BASE_GLYPH_SIZE
  if (wave < -0.55) return 7
  if (wave < -0.16) return 8
  if (energy < 0.32) return 12
  if (energy < 0.72) return 16
  if (energy < 1.3) return 21
  return 26
}

export function AsciiRippleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return
    const interactionSurface =
      canvas.closest<HTMLElement>('.home-hero') ?? canvas

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')

    let columns = 0
    let rows = 0
    let cellWidth = 11
    let lineHeight = 15
    let baseField = new Float32Array()
    let currentField = new Float32Array()
    let previousField = new Float32Array()
    let fontFamily = getComputedStyle(canvas).fontFamily
    let animationFrame = 0
    let lastFrameTime = 0
    let lastAmbientFrameTime = 0
    let ambientPhase = 0
    let latestEnergy = 0
    let isIntersecting = true
    let disposed = false

    const canAnimate = () =>
      !reducedMotion.matches &&
      !coarsePointer.matches &&
      isIntersecting &&
      !document.hidden

    const draw = () => {
      const bounds = canvas.getBoundingClientRect()
      context.clearRect(0, 0, bounds.width, bounds.height)
      context.fillStyle = ASCII_INK
      context.globalAlpha = 1
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      let activeGlyphSize = 0

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column
          const wave = currentField[index] ?? 0
          const horizontalSlope =
            column > 0 && column < columns - 1
              ? Math.abs(
                  currentField[index + 1] - currentField[index - 1]
                )
              : 0
          const verticalSlope =
            row > 0 && row < rows - 1
              ? Math.abs(
                  currentField[index + columns] -
                    currentField[index - columns]
                  )
              : 0
          const slope = horizontalSlope + verticalSlope
          const glyph = glyphFor(
            baseField[index] + wave * 0.2 + slope * 0.09
          )

          const glyphSize = glyphSizeFor(wave, slope)
          if (glyphSize !== activeGlyphSize) {
            context.font = `500 ${glyphSize}px ${fontFamily}`
            activeGlyphSize = glyphSize
          }

          context.fillText(
            glyph,
            column * cellWidth + cellWidth / 2,
            row * lineHeight + lineHeight / 2
          )
        }
      }
    }

    const stepSimulation = () => {
      let maximumEnergy = 0
      const nextField = previousField

      for (let row = 1; row < rows - 1; row += 1) {
        for (let column = 1; column < columns - 1; column += 1) {
          const index = row * columns + column
          const nextValue =
            ((currentField[index - 1] +
              currentField[index + 1] +
              currentField[index - columns] +
              currentField[index + columns]) *
              0.5 -
              previousField[index]) *
            DAMPING

          nextField[index] = nextValue
          maximumEnergy = Math.max(maximumEnergy, Math.abs(nextValue))
        }
      }

      previousField = currentField
      currentField = nextField
      latestEnergy = maximumEnergy
    }

    const scheduleFrame = () => {
      if (!animationFrame && canAnimate()) {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    const tick = (time: number) => {
      animationFrame = 0
      if (!canAnimate()) return

      const rippleActive = latestEnergy > SETTLED_ENERGY
      const frameInterval = rippleActive
        ? RIPPLE_FRAME_INTERVAL
        : AMBIENT_FRAME_INTERVAL

      if (time - lastFrameTime < frameInterval) {
        scheduleFrame()
        return
      }

      lastFrameTime = time

      if (
        lastAmbientFrameTime === 0 ||
        time - lastAmbientFrameTime >= AMBIENT_FRAME_INTERVAL
      ) {
        if (lastAmbientFrameTime !== 0) {
          ambientPhase += Math.min(
            (time - lastAmbientFrameTime) / 1000,
            AMBIENT_FRAME_INTERVAL / 1000
          )
        }
        lastAmbientFrameTime = time
        fillBaseField(baseField, columns, rows, ambientPhase)
      }

      if (rippleActive) {
        stepSimulation()

        if (latestEnergy <= SETTLED_ENERGY) {
          currentField.fill(0)
          previousField.fill(0)
          latestEnergy = 0
        }
      }

      draw()
      scheduleFrame()
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
      cellWidth = bounds.width < 520 ? 9 : 11
      lineHeight = bounds.width < 520 ? 13 : 15
      columns = Math.max(1, Math.floor(bounds.width / cellWidth))
      rows = Math.max(1, Math.floor(bounds.height / lineHeight))

      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio))
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      fontFamily = getComputedStyle(canvas).fontFamily

      baseField = createBaseField(columns, rows, ambientPhase)
      currentField = new Float32Array(columns * rows)
      previousField = new Float32Array(columns * rows)
      latestEnergy = 0
      draw()
    }

    const disturb = (column: number, row: number) => {
      for (
        let targetRow = Math.max(1, row - DISTURBANCE_RADIUS);
        targetRow <= Math.min(rows - 2, row + DISTURBANCE_RADIUS);
        targetRow += 1
      ) {
        for (
          let targetColumn = Math.max(1, column - DISTURBANCE_RADIUS);
          targetColumn <= Math.min(columns - 2, column + DISTURBANCE_RADIUS);
          targetColumn += 1
        ) {
          const distance = Math.hypot(
            targetColumn - column,
            targetRow - row
          )

          if (distance <= DISTURBANCE_RADIUS) {
            const falloff = 1 - distance / DISTURBANCE_RADIUS
            const index = targetRow * columns + targetColumn
            const impulse =
              Math.cos(
                (distance / DISTURBANCE_RADIUS) * Math.PI * 0.5
              ) *
              falloff *
              DISTURBANCE_STRENGTH

            currentField[index] = clamp(
              currentField[index] + impulse,
              -MAX_DISTURBANCE,
              MAX_DISTURBANCE
            )
          }
        }
      }

      latestEnergy = 1
      scheduleFrame()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!canAnimate()) return

      const bounds = canvas.getBoundingClientRect()
      const column = Math.floor(
        ((event.clientX - bounds.left) / bounds.width) * columns
      )
      const row = Math.floor(
        ((event.clientY - bounds.top) / bounds.height) * rows
      )

      disturb(
        clamp(column, 1, Math.max(1, columns - 2)),
        clamp(row, 1, Math.max(1, rows - 2))
      )
    }

    const handleVisibilityChange = () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      } else if (!document.hidden) {
        lastFrameTime = 0
        lastAmbientFrameTime = 0
        draw()
        scheduleFrame()
      }
    }

    const handleMotionPreferenceChange = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }

      currentField.fill(0)
      previousField.fill(0)
      latestEnergy = 0
      lastFrameTime = 0
      lastAmbientFrameTime = 0
      draw()
      scheduleFrame()
    }

    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting

      if (!isIntersecting && animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      } else if (isIntersecting) {
        lastFrameTime = 0
        lastAmbientFrameTime = 0
        draw()
        scheduleFrame()
      }
    })

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    interactionSurface.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotion.addEventListener('change', handleMotionPreferenceChange)
    coarsePointer.addEventListener('change', handleMotionPreferenceChange)
    resize()
    scheduleFrame()

    document.fonts.ready.then(() => {
      if (!disposed) {
        resize()
        scheduleFrame()
      }
    })

    return () => {
      disposed = true
      if (animationFrame) cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      interactionSurface.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange)
      coarsePointer.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [])

  return (
    <div className="ascii-field h-[112.5dvh]" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
