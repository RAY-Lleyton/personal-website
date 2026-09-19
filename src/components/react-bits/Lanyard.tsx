/* eslint-disable react/no-unknown-property */
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, type ThreeElement } from '@react-three/fiber'
import { Environment, Html, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import cardGLB from './card.glb'
import lanyard from './lanyard.png'
import './Lanyard.css'
import { EMAIL, LINKEDIN_URL, PROFILE } from '@/lib/badge'
import ProfileCard from '@/components/react-bits/ProfileCard'
import { SITE } from '@/lib/site-config'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 }
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 }

const CAM_Z = 24.8
const CAM_FOV = 20

/**
 * Deliberately independent of `scale`: the camera used to back off as the card
 * grew, which cancelled most of the size increase. Holding it fixed makes
 * `scale` mean what it says — 2x the value is 2x the rendered lanyard.
 */
function cameraDistance(rope: number) {
  return CAM_Z + rope * 0.75
}

/**
 * The card assembly at cardScale = 1, in the card RigidBody's local units.
 * Everything here scales together — collider, art, and the hook — so the strap
 * always terminates on the metal clip rather than somewhere inside the card.
 */
/**
 * drei's <Html transform> maps DOM pixels into world units at
 * `(distanceFactor ?? 10) / 400` per pixel — see getObjectCSSMatrix in
 * @react-three/drei/web/Html.js, which multiplies the matrix basis by that
 * amount. Sizing the overlay without it renders the card exactly 40x too small.
 */
const HTML_UNITS_PER_PX = 10 / 400

const CARD_BASE = {
  visualScale: 2.25,
  visualOffsetY: -1.2,
  visualOffsetZ: -0.05,
  halfW: 0.8,
  halfH: 1.125,
  /** Top of the clip: where the strap physically attaches. */
  hookY: 1.45,
} as const

/**
 * Puts the fixed end of the strap just past the top edge of the canvas, so the
 * strap reads as coming out of the panel the canvas is hung from rather than
 * floating in the middle of it.
 */
function anchorYForCamera(camZ: number, lookY: number) {
  const halfH = Math.tan(THREE.MathUtils.degToRad(CAM_FOV / 2)) * camZ
  return lookY + halfH + 0.2
}

export function landingHeightToRope(landingHeight: number) {
  return THREE.MathUtils.mapLinear(THREE.MathUtils.clamp(landingHeight, 320, 900), 320, 900, 0.4, 1.2)
}

type LanyardProps = {
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: 'cover' | 'contain'
  lanyardImage?: string | null
  lanyardWidth?: number
  className?: string
  leaving?: boolean
  /** Uniform visual scale around the hang point (does not use CSS transform). */
  scale?: number
  /** 320–900 tweak value → strap rest length */
  landingHeight?: number
}

export default function Lanyard({
  gravity = [0, -40, 0],
  fov = CAM_FOV,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  className = '',
  leaving = false,
  scale = 1,
  landingHeight = 640,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )
  const rope = landingHeightToRope(landingHeight)
  const camZ = cameraDistance(rope)
  const lookY = -0.25 - (scale - 1) * 0.15

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`lanyard-wrapper${leaving ? ' is-leaving' : ''} ${className}`.trim()}>
      <Canvas
        camera={{ position: [0, 0, camZ], fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
          camera.lookAt(0, lookY, 0)
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            key={`${rope.toFixed(2)}-${scale.toFixed(2)}`}
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth * scale}
            cardScale={scale}
            rope={rope}
            camZ={camZ}
            lookY={lookY}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
}

type BandProps = {
  maxSpeed?: number
  minSpeed?: number
  isMobile?: boolean
  frontImage?: string | null
  backImage?: string | null
  imageFit?: 'cover' | 'contain'
  lanyardImage?: string | null
  lanyardWidth?: number
  cardScale?: number
  rope?: number
  camZ?: number
  lookY?: number
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  cardScale = 1,
  rope = 1,
  camZ = CAM_Z,
  lookY = 0,
}: BandProps) {
  const band = useRef<THREE.Mesh>(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<LanyardRigidBody>(null!)
  const j2 = useRef<LanyardRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)
  const hookRef = useRef<THREE.Group>(null!)
  const hookWorld = useRef(new THREE.Vector3())

  const ang = useRef(new THREE.Vector3()).current
  const rot = useRef(new THREE.Vector3()).current

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  }

  const { nodes, materials } = useGLTF(cardGLB) as any
  const texture = useTexture(lanyardImage || lanyard)
  const frontTex = useTexture(frontImage || BLANK_PIXEL)
  const backTex = useTexture(backImage || BLANK_PIXEL)

  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture
    if (!frontImage && !backImage) return baseMap

    const baseImg = baseMap.image as CanvasImageSource & { width: number; height: number }
    const W = baseImg.width
    const H = baseImg.height
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return baseMap
    ctx.drawImage(baseImg, 0, 0, W, H)

    const drawFitted = (
      img: CanvasImageSource & { width: number; height: number },
      rect: typeof FRONT_UV_RECT,
    ) => {
      const rx = rect.x * W
      const ry = rect.y * H
      const rw = rect.w * W
      const rh = rect.h * H
      const pick = imageFit === 'contain' ? Math.min : Math.max
      const nextScale = pick(rw / img.width, rh / img.height)
      const dw = img.width * nextScale
      const dh = img.height * nextScale
      const dx = rx + (rw - dw) / 2
      const dy = ry + (rh - dh) / 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(rx, ry, rw, rh)
      ctx.clip()
      ctx.drawImage(img, dx, dy, dw, dh)
      ctx.restore()
    }

    if (frontImage && frontTex.image) {
      drawFitted(frontTex.image as CanvasImageSource & { width: number; height: number }, FRONT_UV_RECT)
    }
    if (backImage && backTex.image) {
      drawFitted(backTex.image as CanvasImageSource & { width: number; height: number }, BACK_UV_RECT)
    }

    const composite = new THREE.CanvasTexture(canvas)
    composite.colorSpace = THREE.SRGBColorSpace
    composite.flipY = baseMap.flipY
    composite.anisotropy = 16
    composite.needsUpdate = true
    return composite
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map])

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  )

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], rope])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], rope])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], rope])
  // Anchor on the clip, scaled with the card — otherwise a larger card keeps a
  // fixed 1.45-unit anchor and the strap appears to sink into its face.
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_BASE.hookY * cardScale, 0],
  ])

  useFrame((_, delta) => {
    if (!fixed.current || !card.current || !band.current) return

    ;[j1, j2].forEach((ref) => {
      const body = ref.current
      if (!body) return
      if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation())
      const clampedDistance = Math.max(0.1, Math.min(1, body.lerped.distanceTo(body.translation())))
      body.lerped.lerp(
        body.translation(),
        delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
      )
    })

    if (hookRef.current) {
      hookRef.current.getWorldPosition(hookWorld.current)
      curve.points[0].copy(hookWorld.current)
    } else {
      curve.points[0].copy(j3.current.translation())
    }
    curve.points[1].copy(j2.current.lerped!)
    curve.points[2].copy(j1.current.lerped!)
    curve.points[3].copy(fixed.current.translation())
    ;(band.current.geometry as InstanceType<typeof MeshLineGeometry>).setPoints(
      curve.getPoints(isMobile ? 16 : 32),
    )

    ang.copy(card.current.angvel())
    rot.copy(card.current.rotation())
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(-4, 1)
  texture.anisotropy = 8

  const visualScale = CARD_BASE.visualScale * cardScale
  const hookY = CARD_BASE.hookY * cardScale
  const useProfileBadge = SITE.lanyard.badge === 'profile'
  const anchorY = anchorYForCamera(camZ, lookY)

  const linkHit = (href: string, external: boolean | undefined, y: number, label: string) => (
    <Html
      key={href}
      transform
      occlude={false}
      distanceFactor={1.35}
      position={[0, y, 0.12]}
      style={{ pointerEvents: 'auto', userSelect: 'none' }}
    >
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="lanyard-link-hit"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {label}
      </a>
    </Html>
  )

  return (
    <>
      <group position={[0, anchorY, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type="dynamic">
          <group ref={hookRef} position={[0, hookY, 0]} />
          <CuboidCollider args={[CARD_BASE.halfW * cardScale, CARD_BASE.halfH * cardScale, 0.01]} />
          <group
            scale={visualScale}
            position={[0, CARD_BASE.visualOffsetY * cardScale, CARD_BASE.visualOffsetZ]}
          >
            {/* The painted badge face. Hidden under the ProfileCard overlay,
                which occupies the same 0.71 aspect the mesh does. */}
            {!useProfileBadge && (
              <mesh geometry={nodes.card.geometry} raycast={() => null}>
                <meshPhysicalMaterial
                  map={cardMap}
                  map-anisotropy={16}
                  clearcoat={isMobile ? 0 : 1}
                  clearcoatRoughness={0.15}
                  roughness={0.9}
                  metalness={0.8}
                />
              </mesh>
            )}
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
              raycast={() => null}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} raycast={() => null} />
            {!useProfileBadge && linkHit(`mailto:${EMAIL}`, false, -0.52, EMAIL)}
            {!useProfileBadge && linkHit(LINKEDIN_URL, true, -0.66, 'LinkedIn')}
          </group>

          {/*
            Mounted on the RigidBody rather than inside the scaled visual group,
            so its size is expressed directly in card units — the collider is
            the card, so matching its half-extents is exact. `transform` keeps
            it a real DOM node carried by the 3D matrix, which is what lets the
            holographic effects survive the swing.
          */}
          {useProfileBadge && (
            <Html
              transform
              occlude={false}
              position={[0, SITE.lanyard.profileOffsetY, 0.02]}
              scale={
                (CARD_BASE.halfW * 2 * cardScale * SITE.lanyard.profileFit) /
                (SITE.lanyard.profileCardWidth * HTML_UNITS_PER_PX)
              }
              style={{ pointerEvents: 'auto' }}
              zIndexRange={[20, 0]}
            >
              <div
                style={{
                  width: SITE.lanyard.profileCardWidth,
                  ['--lanyard-glare' as string]: SITE.lanyard.profileGlare,
                  ['--lanyard-avatar-size' as string]: `${SITE.lanyard.profileAvatarSize}%`,
                  ['--lanyard-avatar-top' as string]: `${SITE.lanyard.profileAvatarTop}%`,
                }}
              >
                <ProfileCard
                  className="pc-on-lanyard"
                  // the badge already tilts with the physics; a second
                  // pointer-driven tilt on top of it fights the swing
                  enableTilt={false}
                  behindGlowEnabled={false}
                  name={PROFILE.name}
                  title={PROFILE.title}
                  handle={PROFILE.handle}
                  status={PROFILE.status}
                  contactText={PROFILE.contactText}
                  avatarUrl={PROFILE.avatarUrl}
                  onContactClick={() => window.open(`mailto:${EMAIL}`, '_self')}
                />
              </div>
            </Html>
          )}
        </RigidBody>
      </group>
      <mesh ref={band} raycast={() => null}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)
