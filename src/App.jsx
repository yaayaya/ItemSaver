import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ObjectWall from './pages/ObjectWall';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="wall" element={<ObjectWall />} />
        <Route path="scan" element={<Scanner />} />
      </Route>
    </Routes>
  );
}

export default App;
