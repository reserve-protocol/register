import { SVGProps } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" {...props}>
    <path
      fill="#9573F5"
      d="m26.44 10.526 9.78-5.447.007 10.584-7.575 4.22c-5.168 2.878-8.146 6.653-9.349 10.006C18.1 33.24 18.277 35.162 18.238 36c0-5.336.018-6.931.018-11.424 0-1.107.127-2.325.276-2.908 0 0 1.287-7.453 7.908-11.142Z"
    />
    <path
      fill="#6837F1"
      d="M18.234 24.806 18.239 36l-9.252-5.14-.004-8.671C8.98 16.274 7.129 11.836 4.785 9.154 2.44 6.474.676 5.664-.037 5.222 4.58 7.7 5.803 8.37 9.74 10.484c.975.524 2.245 1.521 2.682 1.935 0 0 5.808 4.808 5.812 12.387Z"
    />
    <path
      fill="#D2C3FB"
      d="M26.424 10.526c3.948-2.169 6.815-3.794 9.795-5.447-.751.38-2.353 1.482-5.886 2.083-3.535.601-8.505.472-13.625-2.624L9.2 0-.037 5.224l10.1 5.42c2.516 1.51 8.796 4.038 16.361-.118Z"
    />
    <path
      fill="currentColor"
      d="M57.79 13.914h-3.392v5.46c0 .78.15 1.34.45 1.68.32.32.871.48 1.651.48.38 0 .81-.03 1.291-.09v3.391c-.98.22-1.83.33-2.551.33-1.56 0-2.771-.46-3.632-1.38-.84-.94-1.26-2.34-1.26-4.2v-5.67h-2.251v-3.121h2.25v-3.57H54.4v3.57h3.391v3.12ZM66.568 10.314c1.26 0 2.421.26 3.482.78 1.08.52 1.95 1.36 2.61 2.52.661 1.16.991 2.63.991 4.41 0 .42-.01.74-.03.96H63.477c.16.9.5 1.62 1.02 2.16s1.23.811 2.131.811c1.34 0 2.241-.58 2.701-1.74h4.082c-.38 1.66-1.19 2.92-2.431 3.78-1.22.86-2.681 1.29-4.382 1.29-1.3 0-2.501-.26-3.602-.78-1.1-.54-1.99-1.37-2.671-2.49-.68-1.14-1.02-2.56-1.02-4.26 0-1.68.34-3.07 1.02-4.17.68-1.12 1.57-1.94 2.671-2.461 1.1-.54 2.291-.81 3.572-.81Zm-.03 3.33c-.88 0-1.57.27-2.071.81-.5.52-.83 1.23-.99 2.13h6.092c-.32-1.96-1.33-2.94-3.031-2.94ZM84.164 10.374c1.52 0 2.681.48 3.482 1.44.8.96 1.2 2.28 1.2 3.96v9.031h-4.052v-8.04c0-.9-.21-1.59-.63-2.07-.4-.48-1-.72-1.8-.72-.801 0-1.421.25-1.862.75-.42.5-.63 1.18-.63 2.04v8.04H75.82v-14.01h4.052v1.92c.36-.6.9-1.14 1.621-1.62.74-.48 1.63-.721 2.671-.721ZM101.149 6.594h4.081v18.211h-4.052v-1.53c-.48.62-1.09 1.1-1.83 1.44-.72.34-1.521.51-2.401.51-1.161 0-2.192-.28-3.092-.84-.9-.58-1.6-1.43-2.1-2.55-.501-1.12-.751-2.46-.751-4.02 0-2.36.54-4.19 1.62-5.49 1.101-1.3 2.542-1.951 4.323-1.951.88 0 1.68.17 2.4.51.721.34 1.321.82 1.802 1.44v-5.73Zm-2.912 15.21c1.06 0 1.851-.37 2.371-1.11.541-.74.811-1.7.811-2.88s-.27-2.14-.811-2.88c-.52-.76-1.31-1.14-2.37-1.14-1.061 0-1.842.36-2.342 1.08-.5.72-.75 1.7-.75 2.94s.25 2.22.75 2.94c.5.701 1.28 1.05 2.341 1.05ZM114.631 10.314c1.26 0 2.421.26 3.481.78 1.081.52 1.951 1.36 2.611 2.52.661 1.16.991 2.63.991 4.41 0 .42-.01.74-.03.96h-10.145c.16.9.5 1.62 1.021 2.16.52.54 1.23.811 2.131.811 1.34 0 2.241-.58 2.701-1.74h4.082c-.38 1.66-1.191 2.92-2.431 3.78-1.221.86-2.682 1.29-4.383 1.29-1.3 0-2.501-.26-3.601-.78-1.101-.54-1.991-1.37-2.671-2.49-.681-1.14-1.021-2.56-1.021-4.26 0-1.68.34-3.07 1.021-4.17.68-1.12 1.57-1.94 2.671-2.461 1.1-.54 2.291-.81 3.572-.81Zm-.03 3.33c-.881 0-1.571.27-2.071.81-.501.52-.831 1.23-.991 2.13h6.093c-.32-1.96-1.331-2.94-3.031-2.94ZM127.901 13.224c.46-.98 1.01-1.7 1.65-2.16.641-.46 1.391-.69 2.251-.69.361 0 .811.05 1.351.15v4.23h-.12a4.456 4.456 0 0 0-1.711-.36c-.98 0-1.79.35-2.431 1.05-.64.68-.96 1.63-.96 2.85v6.511h-4.052v-14.01h4.022v2.43ZM139.048 24.805h-4.052V6.563h4.052v18.242ZM148.056 20.425l3.061-9.631h4.382l-7.083 18.841h-4.442l2.041-4.62-5.343-14.221h4.382l3.002 9.63Z"
    />
  </svg>
)
export default SvgComponent
