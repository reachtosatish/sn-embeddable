import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="App">
        <header className="App-header">
          <div>Loading...</div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Auth0 React App</h1>
        
        {!isAuthenticated ? (
          <div>
            <p>Welcome! Please log in to continue.</p>
            <button onClick={() => loginWithRedirect()}>Log In</button>
          </div>
        ) : (
          <div>
            <img src={user.picture} alt={user.name} style={{ borderRadius: '50%', width: '100px' }} />
            <h2>Welcome, {user.name}!</h2>
            <p>Email: {user.email}</p>
            <button onClick={() => logout({ returnTo: window.location.origin })}>
              Log Out
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
