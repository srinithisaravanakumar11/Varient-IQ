import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import VariantExplorer from './pages/VariantExplorer';
import VariantAnalysis from './pages/VariantAnalysis';
import ModelPerformance from './pages/ModelPerformance';
import DatasetPipeline from './pages/DatasetPipeline';
import ResearchReports from './pages/ResearchReports';
import AboutLimitations from './pages/AboutLimitations';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="variants" element={<VariantExplorer />} />
            <Route path="analysis" element={<VariantAnalysis />} />
            <Route path="performance" element={<ModelPerformance />} />
            <Route path="pipeline" element={<DatasetPipeline />} />
            <Route path="reports" element={<ResearchReports />} />
            <Route path="about" element={<AboutLimitations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
