import React, { Component, PropTypes } from 'react';
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

class AsyncLink extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired
  }
  
  handleClick = (event) => {
    event.preventDefault();
    this.props.beforeTransition().then(() => {
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
    const {beforeTransition, ...props} = this.props; // eslint-disable-line no-unused-vars
    
    return (
      <Link onClick={this.handleClick} {...props} />
    );
  }
}

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }
  preload = () => {
    console.info("LOADING");
    return new Promise(resolve => {
      setTimeout(() => resolve({
        loadedAt: new Date(),
        data: ['Data Item 1']
      }), 1000);
    }).then(data => this.setState({ data }, ()=>console.info("LOADED")));
  }
  
  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><AsyncLink beforeTransition={this.preload} to="/data">Fetch Once</AsyncLink></li>
            <li><AsyncLink beforeTransition={this.preload} to="/data">Refetch Every Time</AsyncLink></li>
          </ul>
          <hr/>
          <Route exact path="/" component={Home} />
          <Route path="/data" render={() => <DataView data={this.state.data}/>} />
        </div>
      </Router>
    );
  }
}

class DataView extends Component {
  render() {
    console.log("RENDERING DATA");
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
