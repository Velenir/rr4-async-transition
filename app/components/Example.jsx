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

class Example extends Component {
  constructor() {
    super();
    this.state = { products: null };
  }

  loadProducts = () => {
    return new Promise(resolve => {
      setTimeout(() => resolve([
        'Tesla S',
      ]), 1000);
    }).then(products => this.setState({ products }));
  };

  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><PreloaderLink onPreload={this.loadProducts} to="/products">Products</PreloaderLink></li>
          </ul>

          <hr/>

          <Route exact path="/" component={Home} />
          <Route path="/products" render={() => <Products fetch={this.loadProducts} list={this.state.products} />} />
        </div>
      </Router>
    );
  }
}

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
