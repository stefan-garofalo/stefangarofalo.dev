'use client'

import { useEffect, useRef } from 'react'
import {
  FOREST_ASCII_HEIGHT,
  FOREST_ASCII_LINES,
  FOREST_ASCII_WIDTH,
} from './ascii-forest-data'

const TERRAIN_GLYPHS = ['.', ':', '-', '=', '+', '*', '#', '%', '@'] as const
const FOREST_GLYPHS = [
  ' ',
  '.',
  ':',
  '-',
  '=',
  '+',
  '*',
  '#',
  '%',
  '@',
] as const
const FOREST_DETAIL_GLYPHS = ['.', ':', '/', '+', '*', '#'] as const
const FOREST_SOURCE_RAMP = ' .,:;i1tIl|!+~=<>*#MW&%@$█▓▒░☺☻♥♦♣♠'
const TOP_FILLER_ROWS = 10
const RIPPLE_FRAME_INTERVAL = 1000 / 30
const AMBIENT_FRAME_INTERVAL = 1000 / 9
const AMBIENT_PHASE_SPEED = 2.5
const FOREST_FRAME_INTERVAL = 1000 / 12
const MOBILE_FOREST_FRAME_INTERVAL = 1000 / 10
const FOREST_CELL_ASPECT = 0.56
const DAMPING = 0.96
const MOBILE_DAMPING = 0.9
const SETTLED_ENERGY = 0.003
const ASCII_INK = '#5e605b'
const FOREST_INK = '#7b7d76'
const FOREST_DETAIL_INK = '#b0b2aa'
const BASE_GLYPH_SIZE = 10
const DISTURBANCE_RADIUS = 10
const DISTURBANCE_STRENGTH = 3.6
const MAX_DISTURBANCE = 8
const FOREST_PAINT_COLUMN_HALO = 4
const FOREST_PHYSICS_PADDING = DISTURBANCE_RADIUS + 1
const MOBILE_AUTONOMOUS_INTERVAL = 8000
const MOBILE_AUTONOMOUS_RADIUS = 6
const MOBILE_AUTONOMOUS_STRENGTH = 0.72
const MOBILE_AUTONOMOUS_MAX_DISTURBANCE = 1.6
const MOBILE_TOUCH_FRAME_INTERVAL = 1000 / 20
const MOBILE_TOUCH_PAN_THRESHOLD = 8
const MOBILE_TOUCH_RADIUS = 6
const MOBILE_TOUCH_STRENGTH = 0.72
const MOBILE_TOUCH_MAX_DISTURBANCE = 1.6
const TOPOGRAPHY_VISIBLE_WAVE = 0.025
const TOPOGRAPHY_FULL_PAINT_RATIO = 0.7
const TOPOGRAPHY_DIRTY_COLUMN_PADDING = 3
const TOPOGRAPHY_DIRTY_ROW_PADDING = 2
const ROUTE_INK = '#b8a0d9'
const ROUTE_LABEL_INK = '#d2d0c9'
const CANVAS_BACKDROP = '#11120f'
const TOPOGRAPHY_INK = '#70726b'

export type AsciiBackground = 'forest' | 'terrain' | 'topography'

type AsciiRippleFieldProps = {
  background?: AsciiBackground
  className?: string
  seed?: string
  variant?: 'terrain' | 'workflow-route'
}

type TopographyCell = {
  alpha: number
  glyph: string
  lensGlyph?: string
  size: number
}

type PixelBounds = {
  bottom: number
  left: number
  right: number
  top: number
}

type ForestCell = {
  density: number
  detail: number
  edge: number
  filler: boolean
  index: number
  phase: number
  sky: number
  skyTexture: number
  wind: number
  x: number
  y: number
}

type TopographyPeak = {
  amplitude: number
  angle: number
  radiusX: number
  radiusY: number
  x: number
  y: number
}

type RouteNode = {
  label: 'START' | 'PLAN' | 'IMPLEMENT' | 'REVIEW' | 'COMPLETE'
  x: number
  y: number
  labelX: number
  labelY: number
}

type CubicRouteSegment = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

const DESKTOP_ROUTE_NODES: RouteNode[] = [
  { label: 'START', x: 0.16, y: 0.22, labelX: -0.015, labelY: 0.035 },
  { label: 'PLAN', x: 0.45, y: 0.3, labelX: 0.014, labelY: -0.02 },
  {
    label: 'IMPLEMENT',
    x: 0.66,
    y: 0.5,
    labelX: 0.014,
    labelY: 0.006,
  },
  { label: 'REVIEW', x: 0.67, y: 0.77, labelX: -0.018, labelY: 0.04 },
  {
    label: 'COMPLETE',
    x: 0.94,
    y: 0.75,
    labelX: -0.028,
    labelY: -0.03,
  },
]

const DESKTOP_ROUTE_SEGMENTS: CubicRouteSegment[] = [
  [0.16, 0.22, 0.24, 0.25, 0.36, 0.25, 0.45, 0.3],
  [0.45, 0.3, 0.54, 0.31, 0.64, 0.31, 0.66, 0.5],
  [0.66, 0.5, 0.76, 0.5, 0.77, 0.72, 0.67, 0.77],
  [0.67, 0.77, 0.57, 0.8, 0.55, 0.54, 0.66, 0.5],
  [0.67, 0.77, 0.76, 0.84, 0.84, 0.78, 0.94, 0.75],
]

const MOBILE_ROUTE_NODES: RouteNode[] = [
  { label: 'START', x: 0.13, y: 0.15, labelX: 0, labelY: 0.04 },
  { label: 'PLAN', x: 0.71, y: 0.23, labelX: 0.02, labelY: -0.02 },
  {
    label: 'IMPLEMENT',
    x: 0.72,
    y: 0.43,
    labelX: -0.27,
    labelY: -0.025,
  },
  { label: 'REVIEW', x: 0.33, y: 0.58, labelX: -0.03, labelY: 0.045 },
  {
    label: 'COMPLETE',
    x: 0.81,
    y: 0.66,
    labelX: -0.15,
    labelY: 0.04,
  },
]

const MOBILE_ROUTE_SEGMENTS: CubicRouteSegment[] = [
  [0.13, 0.15, 0.3, 0.12, 0.53, 0.25, 0.71, 0.23],
  [0.71, 0.23, 0.78, 0.28, 0.75, 0.36, 0.72, 0.43],
  [0.72, 0.43, 0.73, 0.57, 0.5, 0.64, 0.33, 0.58],
  [0.33, 0.58, 0.2, 0.51, 0.49, 0.38, 0.72, 0.43],
  [0.33, 0.58, 0.48, 0.7, 0.65, 0.62, 0.81, 0.66],
]

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

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function createRandom(seed: string) {
  let state = hashString(seed) || 1

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function createTopographyPeaks(seed: string): TopographyPeak[] {
  const random = createRandom(seed)
  const anchors = [
    { amplitude: 0.96, radiusX: 0.25, radiusY: 0.21, x: 0.17, y: 0.23 },
    { amplitude: 0.79, radiusX: 0.18, radiusY: 0.16, x: 0.38, y: 0.18 },
    { amplitude: 0.88, radiusX: 0.23, radiusY: 0.2, x: 0.58, y: 0.27 },
    { amplitude: 0.92, radiusX: 0.23, radiusY: 0.19, x: 0.82, y: 0.22 },
    { amplitude: 0.76, radiusX: 0.17, radiusY: 0.15, x: 0.29, y: 0.5 },
    { amplitude: 0.9, radiusX: 0.25, radiusY: 0.22, x: 0.51, y: 0.55 },
    { amplitude: 0.83, radiusX: 0.2, radiusY: 0.18, x: 0.76, y: 0.5 },
    { amplitude: 0.8, radiusX: 0.19, radiusY: 0.17, x: 0.35, y: 0.78 },
    { amplitude: 0.86, radiusX: 0.23, radiusY: 0.2, x: 0.69, y: 0.78 },
    { amplitude: 0.78, radiusX: 0.17, radiusY: 0.16, x: 0.9, y: 0.72 },
  ] as const

  return anchors.map((anchor) => ({
    amplitude: anchor.amplitude * (0.94 + random() * 0.08),
    angle: (random() - 0.5) * Math.PI * 0.55,
    radiusX: anchor.radiusX * (0.94 + random() * 0.12),
    radiusY: anchor.radiusY * (0.94 + random() * 0.12),
    x: clamp(anchor.x + (random() - 0.5) * 0.035, 0.06, 0.94),
    y: clamp(anchor.y + (random() - 0.5) * 0.045, 0.06, 0.94),
  }))
}

function topographyHeight(
  pixelX: number,
  pixelY: number,
  width: number,
  height: number,
  peaks: TopographyPeak[],
  seedOffset: number
) {
  const minimumDimension = Math.max(1, Math.min(width, height))
  let maximumHeight = 0

  for (let index = 0; index < peaks.length; index += 1) {
    const peak = peaks[index]
    const seedPhase =
      ((seedOffset >>> ((index % 4) * 5)) & 1023) / 1023 * Math.PI * 2
    const rawOffsetX = (pixelX - peak.x * width) / minimumDimension
    const rawOffsetY = (pixelY - peak.y * height) / minimumDimension
    const offsetX =
      rawOffsetX +
      Math.sin(rawOffsetY * 15 + seedPhase) * 0.026 +
      Math.sin((rawOffsetX + rawOffsetY) * 9 - seedPhase) * 0.012
    const offsetY =
      rawOffsetY +
      Math.cos(rawOffsetX * 13 - seedPhase * 0.7) * 0.023 +
      Math.sin((rawOffsetX - rawOffsetY) * 8 + seedPhase) * 0.011
    const cosine = Math.cos(peak.angle)
    const sine = Math.sin(peak.angle)
    const rotatedX = offsetX * cosine - offsetY * sine
    const rotatedY = offsetX * sine + offsetY * cosine
    const baseDistance = Math.sqrt(
      (rotatedX * rotatedX) / (peak.radiusX * peak.radiusX) +
        (rotatedY * rotatedY) / (peak.radiusY * peak.radiusY)
    )
    const angle = Math.atan2(rotatedY, rotatedX)
    const angularWarp =
      Math.sin(angle * 3 + seedPhase) * 0.09 +
      Math.sin(angle * 5 - seedPhase * 0.6) * 0.05 +
      Math.sin(angle * 7 + seedPhase * 1.3) * 0.025 +
      valueNoise(
        (pixelX / minimumDimension) * 4.2 + index * 4.7,
        (pixelY / minimumDimension) * 4.2 - index * 3.1
      ) *
        0.035
    const asymmetricLobe = Math.cos(angle - seedPhase * 0.4) * 0.075
    const distance = baseDistance * (1 + angularWarp + asymmetricLobe)
    const hillHeight =
      peak.amplitude * Math.pow(clamp(1 - distance, 0, 1), 1.1)

    maximumHeight = Math.max(maximumHeight, hillHeight)
  }

  return maximumHeight
}

function contourGlyph(
  horizontalGradient: number,
  verticalGradient: number,
  curvature: number,
  contourLevel: number,
  cornerChanges: number
) {
  const tangentX = -verticalGradient
  const tangentY = horizontalGradient
  const horizontal = Math.abs(tangentX)
  const vertical = Math.abs(tangentY)
  const isIndexContour = contourLevel > 0 && contourLevel % 3 === 0

  if (cornerChanges >= 3) return isIndexContour ? '*' : '+'
  if (horizontal > vertical * 2.15) {
    return isIndexContour ? (contourLevel % 2 === 0 ? '═' : '━') : '─'
  }
  if (vertical > horizontal * 2.15) {
    return isIndexContour ? (contourLevel % 2 === 0 ? '║' : '┃') : '│'
  }
  if (Math.abs(curvature) > 0.16) {
    if (horizontalGradient >= 0 && verticalGradient >= 0) return '╭'
    if (horizontalGradient < 0 && verticalGradient >= 0) return '╮'
    if (horizontalGradient >= 0 && verticalGradient < 0) return '╰'
    return '╯'
  }
  if (isIndexContour) return tangentX * tangentY > 0 ? '╲' : '╱'
  return tangentX * tangentY > 0 ? '\\' : '/'
}

function lowlandGlyph(
  horizontalGradient: number,
  verticalGradient: number,
  texture: number,
  alternateTexture: number
) {
  const tangentX = -verticalGradient
  const tangentY = horizontalGradient
  const horizontal = Math.abs(tangentX)
  const vertical = Math.abs(tangentY)

  if (horizontal + vertical > 0.001_5) {
    if (horizontal > vertical * 2) return texture > 0 ? '─' : '-'
    if (vertical > horizontal * 2) return texture > 0 ? '│' : '|'
    if (tangentX * tangentY > 0) return texture > 0 ? '╲' : '\\'
    return texture > 0 ? '╱' : '/'
  }

  const lineGlyphs = ['_', '-', '─', '│', '/', '\\', '╱', '╲'] as const
  const punctuationGlyphs = ['.', '·', ':', ','] as const
  const glyphs =
    alternateTexture > 0.58 ? punctuationGlyphs : lineGlyphs
  return glyphs[
    Math.min(
      glyphs.length - 1,
      Math.floor(((texture + 1) / 2) * glyphs.length)
    )
  ]
}

function lowlandLensGlyph(
  horizontalGradient: number,
  verticalGradient: number,
  texture: number
) {
  const tangentX = -verticalGradient
  const tangentY = horizontalGradient
  const horizontal = Math.abs(tangentX)
  const vertical = Math.abs(tangentY)

  if (horizontal + vertical < 0.001_5) {
    const glyphs = ['─', '│', '/', '\\', '+', '*'] as const
    return glyphs[
      Math.min(
        glyphs.length - 1,
        Math.floor(((texture + 1) / 2) * glyphs.length)
      )
    ]
  }
  if (horizontal > vertical * 2) return texture > 0 ? '─' : '-'
  if (vertical > horizontal * 2) return texture > 0 ? '│' : '|'
  if (tangentX * tangentY > 0) return texture > 0 ? '╲' : '\\'
  return texture > 0 ? '╱' : '/'
}

function createTopography(
  columns: number,
  rows: number,
  cellWidth: number,
  lineHeight: number,
  seed: string,
  bandCount: number,
  topFillerRows = 0
) {
  const length = columns * rows
  const heights = new Float32Array(length)
  const bands = new Uint8Array(length)
  const cells: TopographyCell[] = new Array(length)
  const peaks = createTopographyPeaks(seed)
  const seedOffset = hashString(seed)
  const width = columns * cellWidth
  const contentRows = Math.max(1, rows - topFillerRows)
  const height = contentRows * lineHeight

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      heights[index] = topographyHeight(
        column * cellWidth + cellWidth / 2,
        (row - topFillerRows) * lineHeight + lineHeight / 2,
        width,
        height,
        peaks,
        seedOffset
      )
    }
  }

  for (let index = 0; index < length; index += 1) {
    bands[index] = Math.min(
      bandCount - 1,
      Math.floor(heights[index] * bandCount)
    )
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      const left = row * columns + Math.max(0, column - 1)
      const right = row * columns + Math.min(columns - 1, column + 1)
      const top = Math.max(0, row - 1) * columns + column
      const bottom = Math.min(rows - 1, row + 1) * columns + column
      const bottomRight =
        Math.min(rows - 1, row + 1) * columns +
        Math.min(columns - 1, column + 1)
      const topLeft = Math.max(0, row - 1) * columns + Math.max(0, column - 1)
      const topRight =
        Math.max(0, row - 1) * columns +
        Math.min(columns - 1, column + 1)
      const bottomLeft =
        Math.min(rows - 1, row + 1) * columns +
        Math.max(0, column - 1)
      const cornerBands = [
        bands[index],
        bands[right],
        bands[bottom],
        bands[bottomRight],
      ]
      const minimumBand = Math.min(...cornerBands)
      const maximumBand = Math.max(...cornerBands)
      const isContour = minimumBand !== maximumBand
      const contourLevel = maximumBand
      const cornerChanges =
        Number(cornerBands[0] !== cornerBands[1]) +
        Number(cornerBands[1] !== cornerBands[3]) +
        Number(cornerBands[3] !== cornerBands[2]) +
        Number(cornerBands[2] !== cornerBands[0])
      const texture = hashGrid(column + seedOffset, row - seedOffset)
      const alternateTexture = hashGrid(
        column * 3 - seedOffset,
        row * 5 + seedOffset
      )
      const horizontalGradient = heights[right] - heights[left]
      const verticalGradient = heights[bottom] - heights[top]
      const isSummit =
        heights[index] > 0.72 &&
        heights[index] >= heights[left] &&
        heights[index] >= heights[right] &&
        heights[index] >= heights[top] &&
        heights[index] >= heights[bottom]

      if (row < topFillerRows) {
        const fillerTexture = hashGrid(
          column + seedOffset * 2,
          row - seedOffset * 3
        )
        cells[index] = {
          alpha: 0.28 + ((fillerTexture + 1) / 2) * 0.12,
          glyph:
            fillerTexture > 0.42
              ? '-'
              : fillerTexture > -0.18
                ? '·'
                : '.',
          size: 6,
        }
      } else if (isSummit) {
        cells[index] = {
          alpha: 0.96,
          glyph: contourLevel % 3 === 0 ? '○' : '◦',
          size: 12,
        }
      } else if (isContour) {
        const gradientMagnitude =
          Math.hypot(horizontalGradient, verticalGradient) + 0.000_1
        const mixedDerivative =
          (heights[bottomRight] -
            heights[bottomLeft] -
            heights[topRight] +
            heights[topLeft]) /
          4
        const curvature =
          (verticalGradient ** 2 *
            (heights[right] - heights[index] * 2 + heights[left]) -
            2 *
              horizontalGradient *
              verticalGradient *
              mixedDerivative +
            horizontalGradient ** 2 *
              (heights[bottom] - heights[index] * 2 + heights[top])) /
          gradientMagnitude ** 3
        const isIndexContour =
          contourLevel > 0 && contourLevel % 3 === 0

        cells[index] = {
          alpha: isIndexContour ? 0.86 : 0.64,
          glyph: contourGlyph(
            horizontalGradient,
            verticalGradient,
            curvature,
            contourLevel,
            cornerChanges
          ),
          size: isIndexContour ? 8 : 7,
        }
      } else {
        cells[index] = {
          alpha:
            0.38 +
            ((texture + 1) / 2) * 0.1 +
            Math.min(heights[index], 0.5) * 0.08,
          glyph: lowlandGlyph(
            horizontalGradient,
            verticalGradient,
            texture,
            alternateTexture
          ),
          lensGlyph:
            alternateTexture > -0.25
              ? lowlandLensGlyph(
                  horizontalGradient,
                  verticalGradient,
                  texture
                )
              : undefined,
          size: 6,
        }
      }
    }
  }

  return { cells, heights }
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
  const glyphIndex = Math.min(
    TERRAIN_GLYPHS.length - 1,
    Math.floor(clamp(value, 0, 1) * TERRAIN_GLYPHS.length)
  )

  return TERRAIN_GLYPHS[glyphIndex]
}

function forestGlyphFor(density: number) {
  const glyphIndex = Math.min(
    FOREST_GLYPHS.length - 1,
    Math.floor(clamp(density, 0, 1) * FOREST_GLYPHS.length)
  )

  return FOREST_GLYPHS[glyphIndex]
}

function forestDetailGlyphFor(detail: number) {
  if (detail < 0.045) return ''

  const glyphIndex = Math.min(
    FOREST_DETAIL_GLYPHS.length - 1,
    Math.floor(
      clamp((detail - 0.045) / 0.65, 0, 1) *
        FOREST_DETAIL_GLYPHS.length
    )
  )

  return FOREST_DETAIL_GLYPHS[glyphIndex]
}

function forestSourceLuminance(glyph: string) {
  const index = FOREST_SOURCE_RAMP.indexOf(glyph)
  return index < 0 ? 0.5 : index / (FOREST_SOURCE_RAMP.length - 1)
}

function createForestCells(width: number, height: number) {
  const lineHeight = Math.max(
    height / FOREST_ASCII_HEIGHT,
    width / (FOREST_ASCII_WIDTH * FOREST_CELL_ASPECT)
  )
  const cellWidth = lineHeight * FOREST_CELL_ASPECT
  const offsetX = (width - cellWidth * FOREST_ASCII_WIDTH) / 2
  const offsetY = (height - lineHeight * FOREST_ASCII_HEIGHT) / 2
  const totalRows = FOREST_ASCII_HEIGHT + TOP_FILLER_ROWS
  const densities = new Float32Array(FOREST_ASCII_WIDTH * totalRows)

  for (let row = 0; row < totalRows; row += 1) {
    const sourceRow =
      row < TOP_FILLER_ROWS
        ? []
        : Array.from(FOREST_ASCII_LINES[row - TOP_FILLER_ROWS] ?? '')

    for (let column = 0; column < FOREST_ASCII_WIDTH; column += 1) {
      const cloud =
        Math.sin(column * 0.083 + row * 0.71) +
        Math.sin(column * 0.031 - row * 1.17) +
        hashGrid(column * 2 + row, row * 3 - column) * 0.35
      const cloudLuminance =
        cloud > -0.25
          ? clamp(0.16 + (cloud + 0.25) * 0.055, 0.16, 0.27)
          : 0.04
      const sourceLuminance =
        row < TOP_FILLER_ROWS
          ? cloudLuminance
          : forestSourceLuminance(sourceRow[column] ?? ' ')
      densities[row * FOREST_ASCII_WIDTH + column] = smoothstep(
        clamp(sourceLuminance, 0, 1)
      )
    }
  }

  const paintFirstColumn = clamp(
    Math.floor(-offsetX / cellWidth) - FOREST_PAINT_COLUMN_HALO,
    0,
    FOREST_ASCII_WIDTH - 1
  )
  const paintLastColumn = clamp(
    Math.ceil((width - offsetX) / cellWidth) + FOREST_PAINT_COLUMN_HALO,
    0,
    FOREST_ASCII_WIDTH - 1
  )
  const paintFirstRow = clamp(
    Math.floor(-offsetY / lineHeight) - 1,
    0,
    totalRows - 1
  )
  const paintLastRow = clamp(
    Math.ceil((height - offsetY) / lineHeight) + 1,
    0,
    totalRows - 1
  )
  const cells: ForestCell[] = []

  for (let row = paintFirstRow; row <= paintLastRow; row += 1) {
    const isFiller = row < TOP_FILLER_ROWS
    const verticalPosition = clamp(
      (row - TOP_FILLER_ROWS) / Math.max(FOREST_ASCII_HEIGHT - 1, 1),
      0,
      1
    )

    for (
      let column = paintFirstColumn;
      column <= paintLastColumn;
      column += 1
    ) {
      const index = row * FOREST_ASCII_WIDTH + column
      const density = densities[index]
      const left = column > 0 ? densities[index - 1] : density
      const right =
        column < FOREST_ASCII_WIDTH - 1
          ? densities[index + 1]
          : density
      const above =
        row === TOP_FILLER_ROWS
          ? density
          : row > 0
            ? densities[index - FOREST_ASCII_WIDTH]
            : density
      const below =
        row === TOP_FILLER_ROWS - 1
          ? density
          : row < totalRows - 1
          ? densities[index + FOREST_ASCII_WIDTH]
          : density
      const edge = clamp(
        Math.max(
          Math.abs(right - left),
          Math.abs(below - above)
        ),
        0,
        1
      )
      const foreground = 0.58 + verticalPosition * 0.42
      const darkness = 1 - density
      const interiorTexture =
        0.035 +
        (Math.sin(column * 1.73 + row * 2.41) > 0.42 ? 0.065 : 0)
      const detail = isFiller
        ? edge * 0.12
        : darkness *
          foreground *
          (edge * 0.82 + interiorTexture)
      const wind =
        (isFiller ? 0.08 : Math.pow(darkness, 1.2) * foreground) *
        (0.14 + edge * 1.65)

      cells.push({
        density,
        detail,
        edge,
        filler: isFiller,
        index,
        phase: column * 0.37 + row * 0.23,
        sky: isFiller
          ? 1
          : smoothstep(clamp((density - 0.32) / 0.55, 0, 1)),
        skyTexture:
          (hashGrid(column * 2 + row, row * 3 - column) + 1) / 2,
        wind,
        x: offsetX + (column + 0.5) * cellWidth,
        y: offsetY + (row + 0.5) * lineHeight,
      })
    }
  }

  return {
    cellWidth,
    cells,
    lineHeight,
    offsetX,
    offsetY,
    paintFirstColumn,
    paintFirstRow,
    paintLastColumn,
    paintLastRow,
  }
}

function glyphSizeFor(
  wave: number,
  slope: number,
  baseSize = BASE_GLYPH_SIZE
) {
  const energy = Math.abs(wave) + slope * 0.2

  if (energy < 0.035) return baseSize
  if (wave < -0.55) return 7
  if (wave < -0.16) return 8
  if (energy < 0.32) return 12
  if (energy < 0.72) return 16
  if (energy < 1.3) return 21
  return 26
}

function pointOnCubic(segment: CubicRouteSegment, progress: number) {
  const inverse = 1 - progress
  const [x0, y0, x1, y1, x2, y2, x3, y3] = segment
  const startWeight = inverse ** 3
  const controlOneWeight = 3 * inverse ** 2 * progress
  const controlTwoWeight = 3 * inverse * progress ** 2
  const endWeight = progress ** 3

  return {
    x:
      x0 * startWeight +
      x1 * controlOneWeight +
      x2 * controlTwoWeight +
      x3 * endWeight,
    y:
      y0 * startWeight +
      y1 * controlOneWeight +
      y2 * controlTwoWeight +
      y3 * endWeight,
  }
}

function insetRouteGeometry(
  nodes: RouteNode[],
  segments: CubicRouteSegment[],
  contentRows: number,
  totalRows: number
) {
  const insetY = (value: number) =>
    (TOP_FILLER_ROWS + value * Math.max(contentRows - 1, 1)) /
    Math.max(totalRows - 1, 1)

  return {
    nodes: nodes.map((node) => ({ ...node, y: insetY(node.y) })),
    segments: segments.map(
      ([x0, y0, x1, y1, x2, y2, x3, y3]) =>
        [
          x0,
          insetY(y0),
          x1,
          insetY(y1),
          x2,
          insetY(y2),
          x3,
          insetY(y3),
        ] as CubicRouteSegment
    ),
  }
}

function terrainSlope(
  index: number,
  heights: Float32Array,
  columns: number,
  rows: number
) {
  const row = Math.floor(index / columns)
  const column = index % columns
  const left = row * columns + Math.max(0, column - 1)
  const right = row * columns + Math.min(columns - 1, column + 1)
  const top = Math.max(0, row - 1) * columns + column
  const bottom = Math.min(rows - 1, row + 1) * columns + column

  return (
    Math.abs(heights[right] - heights[left]) +
    Math.abs(heights[bottom] - heights[top])
  )
}

function projectToGentleCell(
  x: number,
  y: number,
  heights: Float32Array,
  columns: number,
  rows: number,
  radius = 3
) {
  const originColumn = clamp(Math.round(x * (columns - 1)), 1, columns - 2)
  const originRow = clamp(Math.round(y * (rows - 1)), 1, rows - 2)
  let bestIndex = originRow * columns + originColumn
  let bestScore = Number.POSITIVE_INFINITY

  for (
    let row = Math.max(1, originRow - radius);
    row <= Math.min(rows - 2, originRow + radius);
    row += 1
  ) {
    for (
      let column = Math.max(1, originColumn - radius);
      column <= Math.min(columns - 2, originColumn + radius);
      column += 1
    ) {
      const distance = Math.hypot(column - originColumn, row - originRow)
      if (distance > radius) continue
      const index = row * columns + column
      const score =
        terrainSlope(index, heights, columns, rows) * 24 +
        heights[index] * 0.55 +
        distance * 0.018

      if (score < bestScore) {
        bestScore = score
        bestIndex = index
      }
    }
  }

  return bestIndex
}

function rasterLine(start: number, end: number, columns: number) {
  let startColumn = start % columns
  let startRow = Math.floor(start / columns)
  const endColumn = end % columns
  const endRow = Math.floor(end / columns)
  const deltaColumn = Math.abs(endColumn - startColumn)
  const deltaRow = Math.abs(endRow - startRow)
  const columnDirection = startColumn < endColumn ? 1 : -1
  const rowDirection = startRow < endRow ? 1 : -1
  let error = deltaColumn - deltaRow
  const indices: number[] = []

  while (true) {
    indices.push(startRow * columns + startColumn)
    if (startColumn === endColumn && startRow === endRow) break
    const doubledError = error * 2
    if (doubledError > -deltaRow) {
      error -= deltaRow
      startColumn += columnDirection
    }
    if (doubledError < deltaColumn) {
      error += deltaColumn
      startRow += rowDirection
    }
  }

  return indices
}

function smoothProjectedCells(points: number[], columns: number) {
  let smoothed = points

  for (let pass = 0; pass < 2; pass += 1) {
    smoothed = smoothed.map((point, index) => {
      if (index === 0 || index === smoothed.length - 1) return point
      const start = Math.max(0, index - 2)
      const end = Math.min(smoothed.length - 1, index + 2)
      let column = 0
      let row = 0

      for (let sample = start; sample <= end; sample += 1) {
        column += smoothed[sample] % columns
        row += Math.floor(smoothed[sample] / columns)
      }

      const count = end - start + 1
      return Math.round(row / count) * columns + Math.round(column / count)
    })
  }

  return smoothed
}

function buildTerrainRoute(
  templates: RouteNode[],
  segments: CubicRouteSegment[],
  heights: Float32Array,
  columns: number,
  rows: number
) {
  const projectedIndices = templates.map((node) =>
    projectToGentleCell(node.x, node.y, heights, columns, rows, 4)
  )
  const nodes = templates.map((node, index) => {
    const projectedIndex = projectedIndices[index]
    return {
      ...node,
      x: (projectedIndex % columns) / Math.max(columns - 1, 1),
      y: Math.floor(projectedIndex / columns) / Math.max(rows - 1, 1),
    }
  })
  const indices = new Set<number>()
  const nodePairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 2],
    [3, 4],
  ] as const

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segment = segments[segmentIndex]
    const projectedPoints: number[] = []
    for (let step = 0; step <= 120; step += 1) {
      const point = pointOnCubic(segment, step / 120)
      projectedPoints.push(
        projectToGentleCell(
          point.x,
          point.y,
          heights,
          columns,
          rows,
          3
        )
      )
    }
    const [startNode, endNode] = nodePairs[segmentIndex]
    projectedPoints[0] = projectedIndices[startNode]
    projectedPoints[projectedPoints.length - 1] = projectedIndices[endNode]
    const smoothPoints = smoothProjectedCells(projectedPoints, columns)

    for (let index = 1; index < smoothPoints.length; index += 1) {
      for (const routeIndex of rasterLine(
        smoothPoints[index - 1],
        smoothPoints[index],
        columns
      )) {
        indices.add(routeIndex)
      }
    }
  }

  return { indices, nodes }
}

export function AsciiRippleField({
  background = 'terrain',
  className = 'h-[112.5lvh]',
  seed = 'stefan-garofalo',
  variant = 'terrain',
}: AsciiRippleFieldProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return
    const interactionSurface =
      canvas.closest<HTMLElement>('[data-ascii-interaction-surface]') ??
      canvas.closest<HTMLElement>('.home-hero') ??
      canvas

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')

    let columns = 0
    let rows = 0
    let visibleRows = 0
    let cellWidth = 11
    let lineHeight = 15
    let baseField = new Float32Array()
    let topographyCells: TopographyCell[] = []
    let previousVisibleRippleBounds: PixelBounds | null = null
    let forestCells: ForestCell[] = []
    let forestPhysicsFirstColumn = 1
    let forestPhysicsFirstRow = 1
    let forestPhysicsLastColumn = 1
    let forestPhysicsLastRow = 1
    let forestOffsetX = 0
    let forestOffsetY = 0
    let currentField = new Float32Array()
    let previousField = new Float32Array()
    let fontFamily = getComputedStyle(canvas).fontFamily
    let canvasWidth = 0
    let canvasHeight = 0
    let canvasDocumentLeft = 0
    let canvasDocumentTop = 0
    let canvasPixelRatio = 0
    let animationFrame = 0
    let frameTimer = 0
    let frameDueTime = 0
    let lastFrameTime = 0
    let lastAmbientFrameTime = 0
    let ambientPhase = 0
    let forestPhase = 0
    let latestEnergy = 0
    let isIntersecting = true
    let disposed = false
    let autonomousStep = 0
    let autonomousTimer = 0
    let activeTouchPointerId = -1
    let touchStartX = 0
    let touchStartY = 0
    let touchGestureIntent: 'pending' | 'horizontal' | 'vertical' = 'pending'
    let lastTouchDisturbanceTime = 0
    let routeIndices: number[] = []
    let routeIndexSet = new Set<number>()
    let routeNodes: RouteNode[] = []
    let asciiInk = ASCII_INK
    let forestInk = FOREST_INK
    let forestDetailInk = FOREST_DETAIL_INK
    let forestDetailStrength = 1
    let forestLightPolarity = 0
    let forestSkyStrength = 1
    let topographyInk = TOPOGRAPHY_INK
    let routeInk = ROUTE_INK
    let routeLabelInk = ROUTE_LABEL_INK
    let canvasBackdrop = CANVAS_BACKDROP
    const canAnimate = () =>
      !reducedMotion.matches &&
      isIntersecting &&
      !document.hidden

    const readCanvasPalette = () => {
      const styles = getComputedStyle(canvas)
      const color = (property: string, fallback: string) =>
        styles.getPropertyValue(property).trim() || fallback

      asciiInk = color('--ascii-ink', ASCII_INK)
      forestInk = color('--forest-ink', FOREST_INK)
      forestDetailInk = color('--forest-detail-ink', FOREST_DETAIL_INK)
      forestDetailStrength =
        Number.parseFloat(
          styles.getPropertyValue('--forest-detail-strength')
        ) || 1
      forestLightPolarity =
        Number.parseFloat(
          styles.getPropertyValue('--forest-light-polarity')
        ) || 0
      forestSkyStrength =
        Number.parseFloat(
          styles.getPropertyValue('--forest-sky-strength')
        ) || 1
      topographyInk = color('--topography-ink', TOPOGRAPHY_INK)
      routeInk = color('--route-ink', ROUTE_INK)
      routeLabelInk = color('--route-label-ink', ROUTE_LABEL_INK)
      canvasBackdrop = color('--canvas-backdrop', CANVAS_BACKDROP)
    }

    const drawForest = () => {
      context.fillStyle = forestInk
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = `500 ${Math.max(8, lineHeight * 0.94)}px ${fontFamily}`

      const motionFor = (cell: ForestCell) => {
        const gustFront = Math.max(
          0,
          Math.sin(cell.x * 0.014 - forestPhase * 1.45 - cell.y * 0.009)
        )
        const travelingWave = Math.sin(
          cell.x * 0.032 - forestPhase * 2.8 + cell.y * 0.006
        )
        const branchFlutter = Math.sin(cell.phase + forestPhase * 4.1)
        const gust =
          gustFront * (travelingWave * 0.72 + branchFlutter * 0.28)
        const branchResponse = clamp(
          cell.wind * 0.72 + cell.detail * 0.48,
          0,
          1
        )
        const ripple =
          clamp(currentField[cell.index] ?? 0, -1.35, 1.35) *
          branchResponse

        return { branchFlutter, gust, ripple }
      }

      for (const cell of forestCells) {
        const { branchFlutter, gust, ripple } = motionFor(cell)
        const darkSourceDensity = cell.filler
          ? 1 - cell.density
          : cell.density
        const darkDensity = clamp(
          0.025 +
            darkSourceDensity * 0.84 +
            gust * cell.edge * 0.055 +
            ripple * cell.edge * 0.035,
          0,
          0.87
        )
        const fillerCloud = clamp(cell.density / 0.18, 0, 1)
        const fillerHashThreshold = 0.52 - fillerCloud * 0.18
        const fillerTexture = smoothstep(
          clamp(
            (cell.skyTexture - fillerHashThreshold) /
              (1 - fillerHashThreshold),
            0,
            1
          )
        )
        const fillerActivity = clamp(
          fillerCloud * fillerTexture,
          0,
          1
        )
        const sparseFillerDensity =
          fillerActivity > 0.04
            ? 0.12 +
              smoothstep(fillerActivity) * 0.26
            : 0.03
        const canonicalLightDensity = clamp(
          0.04 +
            (1 - cell.density) * 0.94 +
            gust * cell.edge * 0.055 +
            ripple * cell.edge * 0.035,
          0,
          0.97
        )
        const canonicalSkyCluster = clamp(
          (1 - cell.density) * 1.2 + cell.skyTexture * 0.55,
          0,
          1
        )
        const sparseCanonicalSkyDensity =
          canonicalSkyCluster > 0.5
            ? 0.12 +
              smoothstep((canonicalSkyCluster - 0.5) / 0.5) * 0.26
            : 0.03
        const canonicalSkyMix = smoothstep(
          clamp((cell.sky - 0.55) / 0.45, 0, 1)
        )
        const lightDensity = cell.filler
          ? clamp(
              sparseFillerDensity +
                gust * cell.edge * 0.025 +
                ripple * cell.edge * 0.02,
              0,
              0.39
            )
          : canonicalLightDensity +
            (sparseCanonicalSkyDensity - canonicalLightDensity) *
              canonicalSkyMix
        const animatedDensity =
          forestLightPolarity === 0
            ? darkDensity
            : darkDensity +
              (lightDensity - darkDensity) * forestLightPolarity
        const glyph = forestGlyphFor(animatedDensity)
        if (glyph === ' ') continue

        const displacement =
          gust * cell.wind * cellWidth * 1.35 +
          ripple * cellWidth * 0.55
        const alphaDensity =
          forestLightPolarity === 0
            ? darkSourceDensity
            : cell.density +
              (animatedDensity - cell.density) * forestLightPolarity
        const baseAlpha = clamp(
          0.1 +
            alphaDensity * 0.62 +
            cell.edge * 0.08 +
            Math.abs(gust) * cell.edge * 0.06 +
            Math.abs(ripple) * cell.edge * 0.08,
          0.1,
          0.8
        )
        context.globalAlpha =
          baseAlpha * (1 + cell.sky * (forestSkyStrength - 1))
        context.fillText(
          glyph,
          cell.x + displacement,
          cell.y + branchFlutter * cell.wind * lineHeight * 0.035
        )
      }

      context.fillStyle = forestDetailInk
      for (const cell of forestCells) {
        if (cell.detail < 0.045) continue

        const { branchFlutter, gust, ripple } = motionFor(cell)
        const animatedDetail = clamp(
          cell.detail +
            Math.abs(gust) * cell.edge * 0.06 +
            ripple * 0.055,
          0,
          0.7
        )
        const glyph = forestDetailGlyphFor(animatedDetail)
        if (!glyph) continue

        const displacement =
          gust * cell.wind * cellWidth * 1.35 +
          ripple * cellWidth * 0.55
        const detailAlpha = clamp(
          0.16 +
            cell.detail * 0.7 +
            Math.abs(gust) * cell.edge * 0.06 +
            Math.abs(ripple) * 0.1,
          0.16,
          0.72
        )
        context.globalAlpha = clamp(
          detailAlpha * forestDetailStrength,
          0.16,
          0.86
        )
        context.fillText(
          glyph,
          cell.x + displacement,
          cell.y + branchFlutter * cell.wind * lineHeight * 0.035
        )
      }

      context.globalAlpha = 1
    }

    const visibleTopographyRippleBounds = () => {
      let firstColumn = columns
      let firstRow = rows
      let lastColumn = -1
      let lastRow = -1

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const wave = currentField[row * columns + column] ?? 0
          if (Math.abs(wave) <= TOPOGRAPHY_VISIBLE_WAVE) continue

          firstColumn = Math.min(firstColumn, column)
          firstRow = Math.min(firstRow, row)
          lastColumn = Math.max(lastColumn, column)
          lastRow = Math.max(lastRow, row)
        }
      }

      if (lastColumn < 0) return null
      if (canvasPixelRatio <= 0) return null

      const extra = 1 / canvasPixelRatio
      const snapDown = (value: number) =>
        Math.max(0, Math.floor(value * canvasPixelRatio) / canvasPixelRatio)
      const snapUp = (value: number, maximum: number) =>
        Math.min(
          maximum,
          Math.ceil(value * canvasPixelRatio) / canvasPixelRatio
        )
      firstColumn = Math.max(
        0,
        firstColumn - TOPOGRAPHY_DIRTY_COLUMN_PADDING
      )
      lastColumn = Math.min(
        columns - 1,
        lastColumn + TOPOGRAPHY_DIRTY_COLUMN_PADDING
      )
      firstRow = Math.max(0, firstRow - TOPOGRAPHY_DIRTY_ROW_PADDING)
      lastRow = Math.min(rows - 1, lastRow + TOPOGRAPHY_DIRTY_ROW_PADDING)
      const bounds = {
        bottom: snapUp((lastRow + 1) * lineHeight + extra, canvasHeight),
        left: snapDown(firstColumn * cellWidth - extra),
        right: snapUp((lastColumn + 1) * cellWidth + extra, canvasWidth),
        top: snapDown(firstRow * lineHeight - extra),
      }

      return bounds.right > bounds.left && bounds.bottom > bounds.top
        ? bounds
        : null
    }

    const paintNonForest = (dirtyBounds: PixelBounds | null) => {
      context.fillStyle =
        background === 'topography' ? topographyInk : asciiInk
      context.globalAlpha = 1
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      let activeGlyphSize = 0
      const firstPaintColumn =
        dirtyBounds
          ? clamp(Math.floor(dirtyBounds.left / cellWidth), 0, columns - 1)
          : 0
      const lastPaintColumn =
        dirtyBounds
          ? clamp(Math.ceil(dirtyBounds.right / cellWidth), 0, columns - 1)
          : columns - 1
      const firstPaintRow =
        dirtyBounds
          ? clamp(Math.floor(dirtyBounds.top / lineHeight), 0, rows - 1)
          : 0
      const lastPaintRow =
        dirtyBounds
          ? clamp(Math.ceil(dirtyBounds.bottom / lineHeight), 0, rows - 1)
          : rows - 1

      for (let row = firstPaintRow; row <= lastPaintRow; row += 1) {
        for (
          let column = firstPaintColumn;
          column <= lastPaintColumn;
          column += 1
        ) {
          const index = row * columns + column
          if (routeIndexSet.has(index)) continue
          const wave = currentField[index] ?? 0
          const horizontalSlope =
            background === 'terrain' &&
            column > 0 &&
            column < columns - 1
              ? Math.abs(
                  currentField[index + 1] - currentField[index - 1]
                )
              : 0
          const verticalSlope =
            background === 'terrain' && row > 0 && row < rows - 1
              ? Math.abs(
                  currentField[index + columns] -
                    currentField[index - columns]
                )
              : 0
          const slope = horizontalSlope + verticalSlope
          const topographyCell = topographyCells[index]
          let glyph =
            background === 'topography'
              ? topographyCell?.glyph ?? ''
              : glyphFor(baseField[index] + wave * 0.2 + slope * 0.09)
          if (!glyph) continue

          if (background === 'topography') {
            const crest = clamp((wave - 0.025) / 0.22, 0, 1)
            const trough = clamp((-wave - 0.025) / 0.22, 0, 1)
            context.globalAlpha = clamp(
              (topographyCell?.alpha ?? 0) +
                crest * 0.52 -
                trough * 0.28,
              0.1,
              1
            )
            if (crest > 0) {
              glyph =
                topographyCell?.lensGlyph ??
                ((topographyCell?.size ?? 0) <= 6 ? '*' : glyph)
            } else if (
              trough > 0 &&
              (topographyCell?.size ?? 0) <= 6
            ) {
              glyph = '·'
            }
          } else {
            context.globalAlpha = 1
          }
          const glyphSize =
            background === 'topography'
              ? (topographyCell?.size ?? BASE_GLYPH_SIZE) +
                Math.round(
                  Math.min(3, Math.max(0, (wave - 0.025) / 0.22) * 3)
                ) -
                Math.round(
                  Math.min(2, Math.max(0, (-wave - 0.025) / 0.22) * 2)
                )
              : glyphSizeFor(wave, slope, BASE_GLYPH_SIZE)
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

      if (variant === 'workflow-route') {
        context.fillStyle = routeInk
        context.globalAlpha = 0.92
        context.font = `600 ${BASE_GLYPH_SIZE}px ${fontFamily}`

        for (const index of routeIndices) {
          const row = Math.floor(index / columns)
          const column = index % columns
          context.fillText(
            '*',
            column * cellWidth + cellWidth / 2,
            row * lineHeight + lineHeight / 2
          )
        }

        context.globalAlpha = 1
        context.lineWidth = 2
        context.strokeStyle = routeInk
        context.fillStyle = routeLabelInk
        context.lineJoin = 'round'
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.font = `500 ${canvasWidth < 520 ? 9 : 11}px ${fontFamily}`

        for (const node of routeNodes) {
          const x = node.x * canvasWidth
          const y =
            background === 'topography'
              ? node.y * Math.max(rows - 1, 1) * lineHeight +
                lineHeight / 2
              : node.y * canvasHeight
          const labelX = x + node.labelX * canvasWidth
          const labelY = y + node.labelY * canvasHeight

          context.lineWidth = 2
          context.strokeStyle = routeInk
          context.beginPath()
          context.arc(x, y, canvasWidth < 520 ? 5 : 6, 0, Math.PI * 2)
          context.stroke()

          context.lineWidth = canvasWidth < 520 ? 3 : 4
          context.strokeStyle = canvasBackdrop
          context.strokeText(node.label, labelX, labelY)
          context.fillText(node.label, labelX, labelY)
        }

        context.fillStyle = routeInk
        context.font = `600 ${canvasWidth < 520 ? 12 : 14}px ${fontFamily}`
        const implementNode = routeNodes[2]
        const reviewNode = routeNodes[3]
        if (implementNode && reviewNode) {
          const nodeY = (node: RouteNode) =>
            background === 'topography'
              ? node.y * Math.max(rows - 1, 1) * lineHeight +
                lineHeight / 2
              : node.y * canvasHeight
          context.fillText(
            '↑',
            implementNode.x * canvasWidth,
            nodeY(implementNode) + 0.035 * canvasHeight
          )
          context.fillText(
            '←',
            (reviewNode.x - 0.035) * canvasWidth,
            nodeY(reviewNode) + 0.015 * canvasHeight
          )
        }
      }

      context.globalAlpha = 1
    }

    const draw = (forceFull = false) => {
      if (background === 'forest') {
        context.clearRect(0, 0, canvasWidth, canvasHeight)
        drawForest()
        return
      }

      if (background !== 'topography' || forceFull) {
        context.clearRect(0, 0, canvasWidth, canvasHeight)
        paintNonForest(null)
        previousVisibleRippleBounds =
          background === 'topography'
            ? visibleTopographyRippleBounds()
            : null
        return
      }

      const currentBounds = visibleTopographyRippleBounds()
      const previousBounds = previousVisibleRippleBounds
      previousVisibleRippleBounds = currentBounds
      if (!currentBounds && !previousBounds) return

      const dirtyBounds =
        currentBounds && previousBounds
          ? {
              bottom: Math.max(currentBounds.bottom, previousBounds.bottom),
              left: Math.min(currentBounds.left, previousBounds.left),
              right: Math.max(currentBounds.right, previousBounds.right),
              top: Math.min(currentBounds.top, previousBounds.top),
            }
          : (currentBounds ?? previousBounds)!
      const fullPaint =
        (dirtyBounds.right - dirtyBounds.left) *
          (dirtyBounds.bottom - dirtyBounds.top) >=
          canvasWidth * canvasHeight * TOPOGRAPHY_FULL_PAINT_RATIO

      if (fullPaint) {
        context.clearRect(0, 0, canvasWidth, canvasHeight)
        paintNonForest(null)
        return
      }

      context.save()
      context.beginPath()
      context.rect(
        dirtyBounds.left,
        dirtyBounds.top,
        dirtyBounds.right - dirtyBounds.left,
        dirtyBounds.bottom - dirtyBounds.top
      )
      context.clip()
      context.clearRect(
        dirtyBounds.left,
        dirtyBounds.top,
        dirtyBounds.right - dirtyBounds.left,
        dirtyBounds.bottom - dirtyBounds.top
      )
      paintNonForest(dirtyBounds)
      context.restore()
    }

    const stepSimulation = () => {
      let maximumEnergy = 0
      const nextField = previousField
      const damping = coarsePointer.matches ? MOBILE_DAMPING : DAMPING
      const simulationFirstColumn =
        background === 'forest' ? forestPhysicsFirstColumn : 1
      const simulationLastColumn =
        background === 'forest' ? forestPhysicsLastColumn : columns - 2
      const simulationFirstRow =
        background === 'forest' ? forestPhysicsFirstRow : 1
      const simulationLastRow =
        background === 'forest' ? forestPhysicsLastRow : rows - 2

      for (
        let row = simulationFirstRow;
        row <= simulationLastRow;
        row += 1
      ) {
        for (
          let column = simulationFirstColumn;
          column <= simulationLastColumn;
          column += 1
        ) {
          const index = row * columns + column
          const nextValue =
            ((currentField[index - 1] +
              currentField[index + 1] +
              currentField[index - columns] +
              currentField[index + columns]) *
              0.5 -
              previousField[index]) *
            damping

          nextField[index] = nextValue
          maximumEnergy = Math.max(maximumEnergy, Math.abs(nextValue))
        }
      }

      previousField = currentField
      currentField = nextField
      latestEnergy = maximumEnergy
    }

    const frameIntervalForCurrentState = () =>
      latestEnergy > SETTLED_ENERGY
        ? coarsePointer.matches
          ? MOBILE_TOUCH_FRAME_INTERVAL
          : RIPPLE_FRAME_INTERVAL
        : background === 'forest'
          ? coarsePointer.matches
            ? MOBILE_FOREST_FRAME_INTERVAL
            : FOREST_FRAME_INTERVAL
          : AMBIENT_FRAME_INTERVAL

    const cancelFrameSchedule = () => {
      if (frameTimer) {
        window.clearTimeout(frameTimer)
        frameTimer = 0
        frameDueTime = 0
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }
    }

    const requestScheduledFrame = () => {
      frameTimer = 0
      frameDueTime = 0
      if (canAnimate() && !animationFrame) {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    const scheduleFrame = () => {
      if (!canAnimate() || animationFrame) return

      const now = performance.now()
      const frameInterval = frameIntervalForCurrentState()
      const delay =
        lastFrameTime === 0
          ? 0
          : Math.max(0, frameInterval - (now - lastFrameTime))
      const dueTime = now + delay

      if (frameTimer && frameDueTime <= dueTime) return
      if (frameTimer) window.clearTimeout(frameTimer)

      if (delay === 0) {
        frameTimer = 0
        frameDueTime = 0
        animationFrame = requestAnimationFrame(tick)
        return
      }

      frameDueTime = dueTime
      frameTimer = window.setTimeout(requestScheduledFrame, delay)
    }

    const tick = (time: number) => {
      animationFrame = 0
      if (!canAnimate()) return

      const rippleActive = latestEnergy > SETTLED_ENERGY
      const frameInterval = frameIntervalForCurrentState()

      const elapsed =
        lastFrameTime === 0 ? frameInterval : time - lastFrameTime
      lastFrameTime = time
      if (background === 'forest') {
        forestPhase += Math.min(elapsed / 1000, frameInterval / 1000)
      }

      if (
        background === 'terrain' &&
        (lastAmbientFrameTime === 0 ||
          time - lastAmbientFrameTime >= AMBIENT_FRAME_INTERVAL)
      ) {
        if (lastAmbientFrameTime !== 0) {
          ambientPhase +=
            Math.min(
              (time - lastAmbientFrameTime) / 1000,
              AMBIENT_FRAME_INTERVAL / 1000
            ) * AMBIENT_PHASE_SPEED
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
      if (
        background === 'forest' ||
        background === 'terrain' ||
        latestEnergy > SETTLED_ENERGY
      ) {
        scheduleFrame()
      }
    }

    const resize = (refreshFontMetrics = false) => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
      const width = bounds.width
      const height = bounds.height
      const sizeChanged =
        width !== canvasWidth ||
        height !== canvasHeight ||
        pixelRatio !== canvasPixelRatio

      canvasDocumentLeft = bounds.left + window.scrollX
      canvasDocumentTop = bounds.top + window.scrollY

      if (!sizeChanged) {
        if (refreshFontMetrics) {
          fontFamily = getComputedStyle(canvas).fontFamily
          draw(true)
        }
        return
      }

      canvasWidth = width
      canvasHeight = height
      canvasPixelRatio = pixelRatio

      if (background === 'forest') {
        const forest = createForestCells(canvasWidth, canvasHeight)
        cellWidth = forest.cellWidth
        lineHeight = forest.lineHeight
        forestCells = forest.cells
        forestPhysicsFirstColumn = clamp(
          forest.paintFirstColumn - FOREST_PHYSICS_PADDING,
          1,
          FOREST_ASCII_WIDTH - 2
        )
        forestPhysicsFirstRow = clamp(
          forest.paintFirstRow - FOREST_PHYSICS_PADDING,
          1,
          FOREST_ASCII_HEIGHT + TOP_FILLER_ROWS - 2
        )
        forestPhysicsLastColumn = clamp(
          forest.paintLastColumn + FOREST_PHYSICS_PADDING,
          forestPhysicsFirstColumn,
          FOREST_ASCII_WIDTH - 2
        )
        forestPhysicsLastRow = clamp(
          forest.paintLastRow + FOREST_PHYSICS_PADDING,
          forestPhysicsFirstRow,
          FOREST_ASCII_HEIGHT + TOP_FILLER_ROWS - 2
        )
        forestOffsetX = forest.offsetX
        forestOffsetY = forest.offsetY
      } else if (background === 'topography') {
        cellWidth = canvasWidth < 520 ? 6 : 7
        lineHeight = canvasWidth < 520 ? 9 : 10
      } else {
        cellWidth = canvasWidth < 520 ? 9 : 11
        lineHeight = canvasWidth < 520 ? 13 : 15
      }
      columns =
        background === 'forest'
          ? FOREST_ASCII_WIDTH
          : Math.max(1, Math.floor(canvasWidth / cellWidth))
      visibleRows =
        background === 'forest'
          ? FOREST_ASCII_HEIGHT
          : Math.max(1, Math.floor(canvasHeight / lineHeight))
      rows =
        background === 'forest' || background === 'topography'
          ? visibleRows + TOP_FILLER_ROWS
          : visibleRows

      canvas.width = Math.max(1, Math.round(canvasWidth * pixelRatio))
      canvas.height = Math.max(1, Math.round(canvasHeight * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      fontFamily = getComputedStyle(canvas).fontFamily

      if (background === 'forest') {
        baseField = new Float32Array()
        topographyCells = []
      } else if (background === 'topography') {
        const topography = createTopography(
          columns,
          rows,
          cellWidth,
          lineHeight,
          seed,
          canvasWidth < 640 ? 6 : 8,
          TOP_FILLER_ROWS
        )
        baseField = topography.heights
        topographyCells = topography.cells
      } else {
        baseField = createBaseField(columns, rows, ambientPhase)
        topographyCells = []
      }
      previousVisibleRippleBounds = null
      currentField = new Float32Array(columns * rows)
      previousField = new Float32Array(columns * rows)
      latestEnergy = 0

      if (variant === 'workflow-route' && background !== 'forest') {
        const compact = canvasWidth < 640
        let templates = compact
          ? MOBILE_ROUTE_NODES
          : DESKTOP_ROUTE_NODES
        let segments = compact
          ? MOBILE_ROUTE_SEGMENTS
          : DESKTOP_ROUTE_SEGMENTS

        if (background === 'topography') {
          const insetRoute = insetRouteGeometry(
            templates,
            segments,
            visibleRows,
            rows
          )
          templates = insetRoute.nodes
          segments = insetRoute.segments
          const route = buildTerrainRoute(
            templates,
            segments,
            baseField,
            columns,
            rows
          )
          routeNodes = route.nodes
          routeIndices = Array.from(route.indices)
          routeIndexSet = route.indices
        } else {
          const indices = new Set<number>()

          routeNodes = templates
          for (const segment of segments) {
            for (let step = 0; step <= 160; step += 1) {
              const point = pointOnCubic(segment, step / 160)
              const column = clamp(
                Math.round(point.x * (columns - 1)),
                0,
                columns - 1
              )
              const row = clamp(
                Math.round(point.y * (rows - 1)),
                0,
                rows - 1
              )
              indices.add(row * columns + column)
            }
          }

          routeIndices = Array.from(indices)
          routeIndexSet = indices
        }
      } else {
        routeIndices = []
        routeIndexSet = new Set()
        routeNodes = []
      }

      draw(true)
    }

    const disturb = (
      column: number,
      row: number,
      radius = DISTURBANCE_RADIUS,
      strength = DISTURBANCE_STRENGTH,
      maximum = MAX_DISTURBANCE
    ) => {
      const firstTargetColumn =
        background === 'forest' ? forestPhysicsFirstColumn : 1
      const lastTargetColumn =
        background === 'forest' ? forestPhysicsLastColumn : columns - 2
      const firstTargetRow =
        background === 'forest' ? forestPhysicsFirstRow : 1
      const lastTargetRow =
        background === 'forest' ? forestPhysicsLastRow : rows - 2

      for (
        let targetRow = Math.max(firstTargetRow, row - radius);
        targetRow <= Math.min(lastTargetRow, row + radius);
        targetRow += 1
      ) {
        for (
          let targetColumn = Math.max(firstTargetColumn, column - radius);
          targetColumn <= Math.min(lastTargetColumn, column + radius);
          targetColumn += 1
        ) {
          const distance = Math.hypot(
            targetColumn - column,
            targetRow - row
          )

          if (distance <= radius) {
            const falloff = 1 - distance / radius
            const index = targetRow * columns + targetColumn
            const impulse =
              Math.cos((distance / radius) * Math.PI * 0.5) *
              falloff *
              strength

            currentField[index] = clamp(
              currentField[index] + impulse,
              -maximum,
              maximum
            )
          }
        }
      }

      latestEnergy = 1
      scheduleFrame()
    }

    const disturbAtPointer = (event: PointerEvent) => {
      const pointerX = event.pageX - canvasDocumentLeft
      const pointerY = event.pageY - canvasDocumentTop
      const column =
        background === 'forest'
          ? Math.floor((pointerX - forestOffsetX) / cellWidth)
          : Math.floor((pointerX / canvasWidth) * columns)
      const row =
        background === 'forest'
          ? Math.floor((pointerY - forestOffsetY) / lineHeight)
          : background === 'topography'
            ? Math.floor(pointerY / lineHeight)
            : Math.floor((pointerY / canvasHeight) * rows)

      const targetColumn = clamp(column, 1, Math.max(1, columns - 2))
      const targetRow = clamp(row, 1, Math.max(1, rows - 2))

      if (event.pointerType === 'touch') {
        disturb(
          targetColumn,
          targetRow,
          MOBILE_TOUCH_RADIUS,
          MOBILE_TOUCH_STRENGTH,
          MOBILE_TOUCH_MAX_DISTURBANCE
        )
      } else {
        disturb(targetColumn, targetRow)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !canAnimate()) {
        return
      }
      if (
        activeTouchPointerId !== -1 &&
        activeTouchPointerId !== event.pointerId
      ) {
        return
      }

      activeTouchPointerId = event.pointerId
      touchStartX = event.clientX
      touchStartY = event.clientY
      touchGestureIntent = 'pending'
      lastTouchDisturbanceTime = 0
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!canAnimate()) return

      if (event.pointerType === 'touch') {
        if (event.pointerId !== activeTouchPointerId) return

        const horizontalTravel = Math.abs(event.clientX - touchStartX)
        const verticalTravel = Math.abs(event.clientY - touchStartY)
        if (touchGestureIntent === 'pending') {
          if (
            Math.max(horizontalTravel, verticalTravel) <
            MOBILE_TOUCH_PAN_THRESHOLD
          ) {
            return
          }
          touchGestureIntent =
            verticalTravel > horizontalTravel ? 'vertical' : 'horizontal'
        }
        if (touchGestureIntent === 'vertical') return

        if (
          lastTouchDisturbanceTime > 0 &&
          event.timeStamp - lastTouchDisturbanceTime <
          MOBILE_TOUCH_FRAME_INTERVAL
        ) {
          return
        }
        lastTouchDisturbanceTime = event.timeStamp
      }

      disturbAtPointer(event)
    }

    const resetTouchGesture = () => {
      activeTouchPointerId = -1
      touchGestureIntent = 'pending'
      lastTouchDisturbanceTime = 0
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' &&
        event.pointerId === activeTouchPointerId
      ) {
        if (touchGestureIntent === 'pending' && canAnimate()) {
          disturbAtPointer(event)
        }
        resetTouchGesture()
      }
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' &&
        event.pointerId === activeTouchPointerId
      ) {
        resetTouchGesture()
      }
    }

    const addAutonomousDisturbance = () => {
      if (
        background === 'forest' ||
        !coarsePointer.matches ||
        !canAnimate() ||
        columns < 3 ||
        rows < 3 ||
        latestEnergy > SETTLED_ENERGY
      ) {
        return
      }

      autonomousStep += 1
      const column = Math.round(
        (0.5 + Math.sin(autonomousStep * 1.618) * 0.28) * (columns - 1)
      )
      const row = Math.round(
        (0.5 + Math.sin(autonomousStep * 1.113 + 0.8) * 0.22) *
          (visibleRows - 1)
      )

      disturb(
        clamp(column, 1, columns - 2),
        clamp(row, 1, rows - 2),
        MOBILE_AUTONOMOUS_RADIUS,
        MOBILE_AUTONOMOUS_STRENGTH,
        MOBILE_AUTONOMOUS_MAX_DISTURBANCE
      )
    }

    const cancelAutonomousTimer = () => {
      if (autonomousTimer) {
        window.clearTimeout(autonomousTimer)
        autonomousTimer = 0
      }
    }

    const scheduleAutonomousDisturbance = () => {
      if (
        autonomousTimer ||
        background === 'forest' ||
        !coarsePointer.matches ||
        !canAnimate()
      ) {
        return
      }

      autonomousTimer = window.setTimeout(() => {
        autonomousTimer = 0
        addAutonomousDisturbance()
        scheduleAutonomousDisturbance()
      }, MOBILE_AUTONOMOUS_INTERVAL)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelFrameSchedule()
        cancelAutonomousTimer()
        return
      }

      lastFrameTime = 0
      lastAmbientFrameTime = 0
      draw()
      scheduleFrame()
      scheduleAutonomousDisturbance()
    }

    const handleMotionPreferenceChange = () => {
      cancelFrameSchedule()
      cancelAutonomousTimer()
      currentField.fill(0)
      previousField.fill(0)
      latestEnergy = 0
      lastFrameTime = 0
      lastAmbientFrameTime = 0
      autonomousStep = 0
      activeTouchPointerId = -1
      touchGestureIntent = 'pending'
      lastTouchDisturbanceTime = 0
      draw()
      scheduleFrame()
      scheduleAutonomousDisturbance()
    }

    const resizeObserver = new ResizeObserver(() => resize())
    const themeObserver = new MutationObserver(() => {
      readCanvasPalette()
      draw(true)
    })
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting

      if (!isIntersecting) {
        cancelFrameSchedule()
        cancelAutonomousTimer()
        return
      }

      lastFrameTime = 0
      lastAmbientFrameTime = 0
      draw()
      scheduleFrame()
      scheduleAutonomousDisturbance()
    })

    resizeObserver.observe(canvas)
    themeObserver.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
      attributes: true,
    })
    intersectionObserver.observe(canvas)
    interactionSurface.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    })
    interactionSurface.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    })
    interactionSurface.addEventListener('pointerup', handlePointerUp, {
      passive: true,
    })
    interactionSurface.addEventListener('pointercancel', handlePointerCancel, {
      passive: true,
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    reducedMotion.addEventListener('change', handleMotionPreferenceChange)
    coarsePointer.addEventListener('change', handleMotionPreferenceChange)
    readCanvasPalette()
    resize()
    scheduleFrame()
    scheduleAutonomousDisturbance()

    document.fonts.ready.then(() => {
      if (!disposed) {
        resize(true)
        scheduleFrame()
      }
    })

    return () => {
      disposed = true
      cancelFrameSchedule()
      cancelAutonomousTimer()
      resizeObserver.disconnect()
      themeObserver.disconnect()
      intersectionObserver.disconnect()
      interactionSurface.removeEventListener('pointerdown', handlePointerDown)
      interactionSurface.removeEventListener('pointermove', handlePointerMove)
      interactionSurface.removeEventListener('pointerup', handlePointerUp)
      interactionSurface.removeEventListener(
        'pointercancel',
        handlePointerCancel
      )
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange)
      coarsePointer.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [background, seed, variant])

  return (
    <div
      className={`ascii-field ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
