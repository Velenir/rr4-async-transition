import React, { Component, PureComponent, PropTypes } from 'react';
import {
  Router,
  Route,
  Link
} from 'react-router-dom';

import createHistory from 'history/createBrowserHistory';

const history = createHistory();

let blockAsyncTransition = false;
// if async transition is in progress, but a normal sync history.push/replace is triggered
// either by Link.onClick or history.back/forward
// disallow async transition to progress
history.listen(() => blockAsyncTransition = true);

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
	
  // keep track of latest async transition
  static transitionInd = 0
  
  handleClick = (event) => {
    event.preventDefault();
    this.setState({ loading: true });
		// allow this transition unless something happens before promise resolves
    blockAsyncTransition = false;
    const ind = ++AsyncLink.transitionInd;
    
    this.props.beforeTransition().then(() => {
      this.setState({ loading: false });
            
      // change path only on final transition
      // otherwise async transition can trigger out of order
      if(blockAsyncTransition || ind < AsyncLink.transitionInd) return;
      
      const { replace, to } = this.props;
      const { router } = this.context;
      const { pathname, search, hash }  = router.location;
      console.log("GOING TO", to);
      if (replace || pathname + search + hash === to) {
        router.replace(to);
      } else {
        router.push(to);
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

// emulate changing data
let dataInd = 0;
function fetchData(once = false) {
  console.log("FETCHING", once ? "once" : "");
  return new Promise(resolve => {
    setTimeout(() => resolve({
      loadedAt: new Date(),
      data: once ? ['Constant Data Item'] : ['Data Item ' + ++dataInd, 'Data Item ' + ++dataInd]
    }), 1000);
  });
}

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, constData: null };
  }
  
	// static so it persists across remounts and multiple instances
  static promisedOnce = null
  
  preload = () => {
    // refetches before every transition
    return fetchData().then(data => this.setState({ data }, ()=>console.log("LOADED")));
  }
  
  preloadOnce = () => {
    // don't bother setting state to constant data
    if(this.state.constData) return Promise.resolve();
    // fetches once, then fills state from the resolved promise
    return (Example.promisedOnce || (Example.promisedOnce = fetchData(true)))
    .then(data => this.setState({ constData: data }, ()=>console.log("LOADED FROM CACHE")));
  }
  
  render() {
    return (
      <Router history={history}>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
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
