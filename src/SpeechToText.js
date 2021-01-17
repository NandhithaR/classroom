import React, { useState, useEffect } from 'react'
import './App.css'
import Sentiment from 'sentiment'
import { BrowserRouter, Switch, Route, Link, Router } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";
import { useRoutes, A } from "hookrouter";
import { CenterFocusStrong } from '@material-ui/icons';

const sentiment = new Sentiment()
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()

mic.continuous = true
mic.interimResults = true
mic.lang = 'en-US'


function SpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState(null)
  const [savedNotes, setSavedNotes] = useState([])
  const [eventSchedule, seteventSchedule] = useState([])
  const [generalSentiment,setgeneralSentiment] = useState('')

  useEffect(() => {
    handleListen()
  }, [isListening])

  const handleListen = () => {
    if (isListening) {
      mic.start()
      mic.onend = () => {
        console.log('continue..')
        mic.start()
      }
    } else {
      mic.stop()
      mic.onend = () => {
        console.log('Stopped Mic on Click')
      }
    }
    mic.onstart = () => {
      console.log('Mics on')
    }

    mic.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      console.log(transcript)
      setNote(transcript)
      const resultSentiment = sentiment.analyze(transcript)
      const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      const month = ['Janurary','February','March','April','May','June','July','August','September','October','November','December']
      const schedWords = ['week','Week','Month','month','tomorrow', 'today']
      if (month.some(substring=>transcript.includes(substring)) || days.some(substring=>transcript.includes(substring)) || schedWords.some(substring=>transcript.includes(substring))) {
        // At least one match
        seteventSchedule(eventSchedule.concat(transcript))
      }
      if(resultSentiment.score<0){
        setgeneralSentiment('Negative')
      }
      else if (resultSentiment.score>0){
        setgeneralSentiment('Positive')
      }
      else{
        setgeneralSentiment('Neutral')
      }
      mic.onerror = event => {
        console.log(event.error)
      }
    }
  }

  const handleSaveNote = () => {
    setSavedNotes([...savedNotes, note])
    setNote('')
  }

  return (
    <>
      <h1 style={{textAlign:'center'}}>Class Room Helper</h1>
      <div className="container">
        <div className="box">
          <h2>Current Note</h2>
          {isListening ? <span>🎙️</span> : <span>🛑</span>}
          <button onClick={handleSaveNote} disabled={!note}>
            Save Note
          </button>
          <button onClick={() => setIsListening(prevState => !prevState)}>
            Start/Stop
          </button>
          <p>{note}</p>
        </div>
        <div className="box">
          <h2>Notes</h2>
          {savedNotes.map(n => (
            <p key={n}>{n}</p>
          ))}
        </div>
      </div>
      <div className="container">
        <div className="box">
        <h2>Sentiment</h2>
        <p>{generalSentiment}</p>
        </div>
        <div className="box">
        <h2>Important Dates</h2>
        <p>{eventSchedule}</p>
        </div>
      </div>
      {/* <Router>
        <div> */}
        <div style={{textAlign:'right',marginRight:'80px',marginTop:'-20px',fontSize:'150%'}}>
          <Link to="/rooms" target="_blank">Join Chat Room</Link>
          </div>
          {/* <Route path="/rooms" component={WelcomeScreen} /> */}
        {/* </div>
      </Router> */}
    </>
  )
}

export default SpeechToText