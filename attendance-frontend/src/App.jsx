import { useEffect } from 'react'
import myLogo from './assets/myLogo.svg'
import './App.css'

function App() {

  useEffect(() => {
    document.title = 'سامانه حضور و غیاب'
  }, [])

  return (
    <div className="container">
    <header>
    <img src={myLogo} className="logo" alt="لوگوی سامانه حضور و غیاب" />
    <h1>سامانه حضور و غیاب</h1>
    </header>


    <p></p>
    </div>
  )
}

export default App
