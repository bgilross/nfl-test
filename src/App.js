import Main from './components/Main'
import MainPage from './components/MainPage'
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
