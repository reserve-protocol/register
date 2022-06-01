import { Button, Container } from 'components'
import { atom, useAtom } from 'jotai'

const nameAtom = atom('')
const tickerAtom = atom('')
const ownershipAtom = atom('')


const Deploy = () => {
  const [name, setName] = useAtom(nameAtom)

  return (
    <Container>
      {name}
      <Button onClick={() => setName('test')}>set</Button>
    </Container>
  )
}

export default Deploy
