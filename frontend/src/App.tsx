// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalGestureProvider } from '@/contexts/GlobalGestureProvider';
import Cover from '@/pages/Cover';
import Navigation from '@/pages/Navigation';
import Turntable from '@/pages/Turntable';
import Ballroom from '@/pages/Ballroom';
import Collection from '@/pages/Collection';

function App() {
  return (
    <BrowserRouter>
      <GlobalGestureProvider>
        <Routes>
          <Route path="/" element={<Cover />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/turntable" element={<Turntable />} />
          <Route path="/ballroom" element={<Ballroom />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </GlobalGestureProvider>
    </BrowserRouter>
  );
}

export default App;