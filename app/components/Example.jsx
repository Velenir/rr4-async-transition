import React, { Component, PureComponent, PropTypes } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';


// keep track of transition index
const TrId = {
  id: 0,
  inc() {
    return ++TrId.id;
  }
};

class AsyncLink extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  
  static contextTypes = {
    router: PropTypes.shape({
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired
  }
  
  handleClick = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const transitionInd = TrId.inc();
    
    this.props.beforeTransition().then(() => {
      this.setState({ loading: false });
            
      // change path only on final transition
      // otherwise async transition can trigger out of order
      if(transitionInd < TrId.id) return;
      
      const { replace, to } = this.props;
      console.log("GOING TO", to);
      if (replace) {
        this.context.router.replace(to);
      } else {
        this.context.router.push(to);
      }
    });
  }
  
  render() {
    const {beforeTransition, children, ...props} = this.props; // eslint-disable-line no-unused-vars
    
    return (
      <Link onClick={this.handleClick} {...props} >
        {children}
        {this.state.loading && "..."}
      </Link>
    );
  }
}

// Need TrId.inc() in every Link to account for late async transitions
const SyncLink = (props) => <Link {...props} onClick={TrId.inc}/>;

// emulate changing data
let dataInd = 0;

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, constData: null };
  }
  
	// static so it persists across remounts and multiple instances
  static promisedOnce = null
  
  fetchData(once = false) {
    console.log("FETCHING", once ? "once" : "");
    return new Promise(resolve => {
      setTimeout(() => resolve({
        loadedAt: new Date(),
        data: once ? ['Constant Data Item'] : ['Data Item ' + ++dataInd, 'Data Item ' + ++dataInd]
      }), 1000);
    });
  }
  
  preload = () => {
    // refetches before every transition
    return this.fetchData().then(data => this.setState({ data }, ()=>console.log("LOADED")));
  }
  
  preloadOnce = () => {
    // fetches once, then fills state from the resolved promise
    return (Example.promisedOnce || (Example.promisedOnce = this.fetchData(true)))
    .then(data => this.setState({ constData: data }, ()=>console.log("LOADED FROM CACHE")));
  }
  
  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><SyncLink to="/">Home</SyncLink></li>
            <li><AsyncLink beforeTransition={this.preloadOnce} to="/data_once">Fetch Once</AsyncLink></li>
            <li><AsyncLink beforeTransition={this.preload} to="/data_refresh">Refetch Every Time</AsyncLink></li>
          </ul>
          <hr/>
          <Route exact path="/" component={Home} />
          {/* renders DataView if data exists, otherwise requests data and renders Loading... */}
          <Route path="/data_once" render={() => (this.state.constData ? <DataView data={this.state.constData}/> :
            (this.preloadOnce(), <p>Loading...</p>))} />
          <Route path="/data_refresh" render={() => (this.state.data ? <DataView data={this.state.data}/> :
            (this.preload(), <p>Loading...</p>))} />
        </div>
      </Router>
    );
  }
}


class DataView extends PureComponent {
  render() {
    const {data, loadedAt} = this.props.data;
    
    return (
      <div>
        <h4>Loaded at {loadedAt.toTimeString()}</h4>
        <ul>
          {data.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    );
  }
}


const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);


export default Example;
