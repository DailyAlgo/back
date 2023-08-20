import renderMain from './render_main'

interface Props {
  data: {
    token: string
  }
}

const page = ({ data }: Props) => {
  return renderMain(data.token)
}

export default page
