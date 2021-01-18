import React, { useState, useEffect } from 'react'
import './App.css'
import Sentiment from 'sentiment'
import findDates from 'datefinder'
import { BrowserRouter, Switch, Route, Link, Router } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";
import useTextToxicity from 'react-text-toxicity'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { colors } from '@material-ui/core';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';




const sentiment = new Sentiment()
// const dateFind = new findDates()
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()
// const localizer = momentLocalizer(moment)


mic.continuous = true
mic.interimResults = true
mic.lang = 'en-US'

function Toxicity({ predictions }) {
  const style = { margin: 10 };

  if (!predictions) return <div style={style}>Loading predictions...</div>;

  return (
    <div style={style}>
      {predictions.map(({ label, match, probability }) => (
        <div style={{ margin: 5 }} key={label}>
          {`${label} - ${probability} - ${match ? "🤢" : "🥰"}`}
        </div>
      ))}
    </div>
  );
}


function SpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState(null)
  const [savedNotes, setSavedNotes] = useState([])
  const [eventSchedule, seteventSchedule] = useState([])
  const [generalSentiment,setgeneralSentiment] = useState('')
  const [value, setValue] = useState("");
  const predictions = useTextToxicity(value);
  const [calDate, setCalDate] = useState(new Date())
  const threshold = 0.9;
  const eventItem = {}

  const events = [
    {
        start: '2015-07-20',
        end: '2015-07-02',
        eventClasses: 'optionalEvent',
        title: 'test event',
        description: 'This is a test description of an event',
    },
    {
        start: '2015-07-19',
        end: '2015-07-25',
        title: 'test event',
        description: 'This is a test description of an event',
        data: 'you can add what ever random data you may want to use later',
    },
];
 


  // const [setisPositive,isPositive] = useState(true)

  useEffect(() => {
    handleListen()
    fetch(`http://127.0.0.1:5000/getDates?text=${note}`, {
      method: "GET",
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }).then(response => 
    response.json().then(data=>{
      console.log(data)
    }))
  }, [isListening])

  // useEffect(()=>{
  //   fetch("http://127.0.0.1:5000/getDates?text=${note}").then(response => 
  //   response.json().then(data=>{
  //     console.log(data)
  //   }))
  // })

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
      // console.log(transcript)
      setNote(transcript)
      // testToxicity(transcript)
      // predictions = useTextToxicity(transcript, { threshold, delay });
      
      const resultSentiment = sentiment.analyze(transcript)
      const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      const month = ['Janurary','February','March','April','May','June','July','August','September','October','November','December']
      const schedWords = ['week','Week','Month','month','tomorrow', 'today']
      var dates = findDatesInNote(transcript)
      // console.log(dates)
      var filterDates = dates.map(x => x['date'])
      seteventSchedule(JSON.stringify(filterDates))
      onChangeCal(filterDates)
      if(resultSentiment.score<0){
        setgeneralSentiment('Negative')
      }
      else if (resultSentiment.score>0){
        setgeneralSentiment('Positive')
        // setisPositive(true)
      }
      else{
        setgeneralSentiment('Neutral')
        // setisPositive(false)
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

  const findDatesInNote = (text) => {
    return findDates(text)
  }

  const onChangeCal = (calDate) => {
    setCalDate(calDate)
}


  return (
    <>
      <div className="banner">
        <h1 style={{textAlign:'center',color:'white', marginRight:'-850px'}}>UltraZoom</h1>
      </div>
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
        <div>
          <textarea
            style={{ width: 300, height: 200 }}
            value={note}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        {value && <Toxicity predictions={predictions} />}
      </div>
        {/* <div className="box">
        <h2>Important Dates</h2>
        <p>{eventSchedule}</p>
        </div> */}
        <div style={{margin:'40px', marginLeft:'250px'}}>
          <div className="result-calendar" style={{float:'left'}}>
            <Calendar onChange={onChangeCal} value={calDate}/>
          </div>
            <div>
            <textarea
            style={{ width: 300, height: 250, float:'right' }}
             />
             </div>
        </div>
      </div>
        <div style={{textAlign:'right',marginRight:'80px',marginTop:'-20px',fontSize:'150%'}}>
          <Link to="/rooms" target="_blank">Join Chat Room</Link>
        </div>
    </>
  )
}

export default SpeechToText