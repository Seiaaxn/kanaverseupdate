import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage/index';
import StreamingAnime from './pages/streaming/StreamingAnime';
import StreamingDonghua from './pages/streaming/StreamingDonghua';
import ExplorerPage from './pages/ExplorerPage';
import MyListPage from './pages/MyListPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';
import AutoToTop from './components/AutoToTop';
import Search from './pages/Search';
import AllAnimePage from './pages/AllAnimePage';
import AllDonghuaPage from './pages/AllDonghuaPage';
import AllMoviesPage from './pages/AllMoviesPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <>
      <AutoToTop />
      <Routes>
        <Route path="/detail/:category/:id" element={<DetailPage />} />
        <Route path="/anime/watch" element={<StreamingAnime />} />
        <Route path="/donghua/watch" element={<StreamingDonghua />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorerPage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/all-anime" element={<AllAnimePage />} />
          <Route path="/all-donghua" element={<AllDonghuaPage />} />
          <Route path="/all-movies" element={<AllMoviesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
      
