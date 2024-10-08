import Main from './components/Main'
import { DataProvider } from './context/dataContext'

const App = () => {
  return (
    <div>
      <DataProvider>
        <Main />
      </DataProvider>
    </div>
  )
}
export default App
