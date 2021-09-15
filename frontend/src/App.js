import './App.css';
import Web3Wrapper from './web3/wrapper/Web3Wrapper';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Exchange from './pages/Exchange';

function App() {
  return (
    <div className="App">
      <Web3Wrapper>
        <Router>
          <Switch>
            
          <Route exact path='/'>
              <Home />
            </Route>

            <Route exact path='/exchange'>
              <Exchange />
            </Route>

            
          </Switch>
        </Router>
      </Web3Wrapper>
    </div>
  );
}

export default App;
