import React, {useEffect} from 'react';      
import './Calculator.css';

function Calculator() {
    useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=a1576db693034891a942d4ae98c393ec";
    script.async = true;

    script.onload = () => {
        const elt = document.getElementById("calculator");
        const calculator = window.Desmos.Calculator(elt, { // <--- use window.Desmos
            keypad: true,
            expressions: true,
            settingsMenu: true
        });

        calculator.setExpression({ id: 'graph1', latex: 'y=x^2' });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="calculator" className='calculator-wrapper'>

    </div>
  );
}


export default Calculator;