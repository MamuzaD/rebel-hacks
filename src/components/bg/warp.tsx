import { useTheme } from '@/components/theme/provider'
import { Warp as WarpShader } from '@paper-design/shaders-react'

export function Warp() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="w-full h-full">
      <WarpShader
        width={1280}
        height={720}
        colors={
          resolvedTheme === 'dark' ? ['#eb003f', '#000000'] : ['#eb003f', '#ffffff']
        }
        proportion={0.57}
        softness={0.5}
        distortion={0}
        swirl={0.24}
        swirlIterations={5}
        shape="stripes"
        shapeScale={3}
        speed={6}
        rotation={172}
      />
    </div>
  )
}
