import React, { Component, PureComponent, PropTypes } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';

class PreloaderLink extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired
  }

  constructor() {
    super();
    this.state = { loading: false };
  }

  handleClick = (evt) => {
    evt.preventDefault();
    this.setState({ loading: true });
    this.props.onPreload().then(() => {
      this.setState({ loading: false });
      const { replace, to } = this.props;
      if (replace) {
        this.context.router.replace(to);
      } else {
        this.context.router.push(to);
      }
    });
  };

  render() {
    const {onPreload, ...props} = this.props; // eslint-disable-line no-unused-vars
    
    return (
      <Link onClick={this.handleClick} {...props}>
        {this.props.children}
        {this.state.loading ? ' [loading...]' : null}
      </Link>
    );
  }
}

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
    console.log("trInd =", TrId.id);
    this.props.beforeTransition().then(() => {
      this.setState({ loading: false });
      
      console.log(transitionInd, "<", TrId.id, "===", transitionInd < TrId.id);
      if(transitionInd < TrId.id) console.log("STAY");
      else console.log("GO");
      
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

// emulate changing data
let dataInd = 0;

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, constData: null };
  }
  
  static promisedOnce
  
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
    console.info("LOADING");
    // this.setState({data: null});
    return this.fetchData().then(data => this.setState({ data }, ()=>console.info("LOADED")));
  }
  
  preloadOnce = () => {
    console.info("ONCE");
    // this.setState({ data: null, constData: null });
    return (Example.promisedOnce || (Example.promisedOnce = this.fetchData(true)))
    .then(data => this.setState({ constData: data }, ()=>console.info("LOADED FROM CACHE")));
  }
  
  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><Link to="/" onClick={TrId.inc}>Home</Link></li>
            <li><AsyncLink beforeTransition={this.preloadOnce} to="/data_once">Fetch Once</AsyncLink></li>
            <li><AsyncLink beforeTransition={this.preload} to="/data_refresh">Refetch Every Time</AsyncLink></li>
          </ul>
          <hr/>
          <Route exact path="/" component={Home} />
          <Route path="/data_once" render={() => (console.log("/data_once", !!this.state.constData), this.state.constData ? <DataView data={this.state.constData}/> :
            (this.preloadOnce(), <p>Loading...</p>))} />
          <Route path="/data_refresh" render={() => (console.log("/data_refresh", !!this.state.data), this.state.data ? <DataView data={this.state.data}/> :
            (this.preload(), <p>Loading...</p>))} />
        </div>
      </Router>
    );
  }
}

window.Example = Example;

class DataView extends PureComponent {
  render() {
    const {data, loadedAt} = this.props.data;
    console.info("RENDERING DATA", data);
    
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

// class Example extends Component {
//   constructor() {
//     super();
//     this.state = { products: null };
//   }
//
//   loadProducts = () => {
//     console.info("LOADING");
//     return new Promise(resolve => {
//       setTimeout(() => resolve([
//         'Tesla S',
//       ]), 1000);
//     }).then(products => this.setState({ products }, ()=>console.info("LOADED")));
//   };
//
//   render() {
//     return (
//       <Router>
//         <div>
//           <ul>
//             <li><Link to="/">Home</Link></li>
//             <li><PreloaderLink onPreload={this.loadProducts} to="/products">Products</PreloaderLink></li>
//           </ul>
//
//           <hr/>
//
//           <Route exact path="/" component={Home} />
//           <Route path="/products" render={() => <Products fetch={this.loadProducts} list={this.state.products} />} />
//         </div>
//       </Router>
//     );
//   }
// }

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

class Products extends Component {
  componentDidMount() {
    if (this.props.list == null) {
      this.props.fetch();
    }
  }

  render() {
    const { list } = this.props;

    if (list == null) {
      return <p>Loading...</p>;
    }

    return (
      <div>
        <h2>Products</h2>
        <ul>
          {list.map((product, i) => <li key={i}>{product}</li>)}
        </ul>
      </div>
    );
  }
}

export default Example;
