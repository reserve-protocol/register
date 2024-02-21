import { SVGProps } from 'react'

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={120}
    height={33}
    viewBox="0 0 98 27"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.623 20.76v-7.697H0V9.928h3.623V8.815H0V5.75h3.623V.76h8.23c2.157 0 3.754.507 4.79 1.521 1.035 1.005 1.553 2.556 1.553 4.652 0 1.59-.382 2.867-1.147 3.834-.765.956-1.828 1.622-3.194 1.995l4.631 7.998h-4.282l-4.253-7.682H7.484v7.682H3.623ZM7.484 9.934h4.878c1.21 0 1.814-.666 1.814-1.996V5.884c0-.67-.135-1.148-.407-1.436-.26-.296-.73-.445-1.407-.445H7.484v5.931ZM52.768 4.15h-3.245V.86h3.245v3.29ZM71.21 6.6V2.395h-2.963v2.06c0 .639-.179 1.156-.536 1.551-.357.395-.884.593-1.58.593h-.705v2.906h2.539v6.912c0 1.28.367 2.285 1.1 3.02.734.714 1.74 1.071 3.02 1.071.846 0 1.513-.103 2.002-.31v-2.709a5.737 5.737 0 0 1-1.128.113c-.602 0-1.044-.131-1.326-.395-.282-.282-.423-.724-.423-1.326V9.505h2.85V6.599h-2.85ZM54.366 16.615l2.85-.79c.056.658.329 1.213.818 1.664.489.452 1.147.677 1.975.677.64 0 1.138-.15 1.495-.451.376-.3.564-.677.564-1.128 0-.79-.536-1.298-1.608-1.524l-2.031-.452c-1.185-.263-2.098-.752-2.737-1.467-.64-.714-.96-1.56-.96-2.539 0-1.204.49-2.238 1.468-3.103.978-.884 2.172-1.326 3.583-1.326.903 0 1.702.131 2.398.395.696.263 1.232.61 1.608 1.043.395.414.696.819.903 1.214.207.395.339.79.395 1.185l-2.765.79c-.075-.527-.32-.997-.733-1.411-.395-.433-.997-.649-1.806-.649-.564 0-1.035.16-1.41.48-.377.3-.565.667-.565 1.1 0 .771.46 1.25 1.383 1.439l2.087.423c1.28.282 2.258.79 2.935 1.524.677.733 1.015 1.617 1.015 2.652 0 1.147-.46 2.172-1.382 3.075-.903.884-2.173 1.326-3.809 1.326-.94 0-1.787-.14-2.54-.423-.733-.282-1.316-.64-1.749-1.072a7.318 7.318 0 0 1-.987-1.326 3.675 3.675 0 0 1-.395-1.326ZM36.351 20.31l-3.019.79c.188 1.43.884 2.624 2.088 3.583 1.204.96 2.69 1.439 4.458 1.439 2.407 0 4.185-.677 5.332-2.032 1.148-1.335 1.721-3.018 1.721-5.05V6.6h-3.16v1.749c-.696-1.335-2.05-2.003-4.063-2.003-1.862 0-3.385.649-4.57 1.947-1.185 1.297-1.778 2.877-1.778 4.74 0 1.937.593 3.536 1.778 4.796 1.204 1.26 2.727 1.89 4.57 1.89.94 0 1.76-.188 2.455-.564.696-.376 1.204-.856 1.524-1.439v1.439c0 2.746-1.298 4.12-3.894 4.12-.922 0-1.702-.283-2.342-.847-.62-.546-.987-1.251-1.1-2.116Zm6.433-4.43c-.64.696-1.486 1.044-2.54 1.044-1.072 0-1.937-.348-2.595-1.044-.659-.715-.988-1.665-.988-2.85 0-1.166.33-2.097.988-2.793.677-.714 1.542-1.072 2.595-1.072 1.035 0 1.881.358 2.54 1.072.658.696.987 1.627.987 2.793 0 1.185-.329 2.135-.987 2.85Zm6.74 4.458h3.244V6.599h-3.245v13.74Zm28.636-8.38h6.743c-.038-.865-.348-1.589-.931-2.172-.564-.583-1.383-.875-2.455-.875-.978 0-1.768.31-2.37.931-.602.602-.93 1.308-.987 2.116Zm7.11 3.584 2.765.874c-.395 1.26-1.138 2.304-2.23 3.132-1.071.809-2.397 1.213-3.977 1.213-1.957 0-3.621-.668-4.994-2.003-1.355-1.335-2.032-3.122-2.032-5.36 0-2.107.659-3.838 1.975-5.192 1.336-1.354 2.906-2.031 4.712-2.031 2.107 0 3.752.648 4.938 1.946 1.184 1.28 1.777 3.01 1.777 5.192 0 .583-.028.93-.085 1.044H78.075c.038 1.034.414 1.89 1.129 2.567.733.677 1.608 1.016 2.624 1.016 1.768 0 2.915-.8 3.442-2.398Zm12.692-5.7V6.514a4.45 4.45 0 0 0-.875-.085c-.903 0-1.712.217-2.426.65a3.622 3.622 0 0 0-1.552 1.72V6.6h-3.188v13.74h3.273v-6.546c0-2.69 1.232-4.034 3.696-4.034.338 0 .696.028 1.072.084Zm-69.276 2.12h-6.743c.057-.808.386-1.514.988-2.116.602-.62 1.392-.93 2.37-.93 1.072 0 1.89.29 2.455.874.583.583.893 1.307.93 2.172Zm3.132 4.458-2.765-.874c-.526 1.598-1.674 2.398-3.442 2.398-1.015 0-1.89-.339-2.624-1.016-.714-.677-1.09-1.533-1.128-2.567h10.044c.056-.113.085-.461.085-1.044 0-2.182-.593-3.913-1.778-5.192-1.185-1.297-2.83-1.946-4.937-1.946-1.806 0-3.377.677-4.712 2.031-1.317 1.354-1.975 3.085-1.975 5.191 0 2.239.677 4.026 2.031 5.361 1.373 1.335 3.038 2.003 4.994 2.003 1.58 0 2.906-.404 3.978-1.213 1.091-.828 1.834-1.872 2.23-3.132Z"
      clipRule="evenodd"
    />
  </svg>
)

export default Logo
