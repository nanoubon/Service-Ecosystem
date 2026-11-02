import { Navigate, createBrowserRouter, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import Overview from './pages/Overview';
import AssetHealth from './pages/AssetHealth';
import AssetDetail from './pages/AssetDetail';
import Energy from './pages/Energy';
import Findings from './pages/Findings';
import FindingDetail from './pages/FindingDetail';
import WorkOrders from './pages/WorkOrders';
import Verification from './pages/Verification';
import MV from './pages/MV';
import DataQuality from './pages/DataQuality';

export const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Overview /> },
    { path: 'asset-health', element: <AssetHealth /> },
    { path: 'asset-health/:assetId', element: <AssetDetail /> },
    // legacy links: /assets → /asset-health
    { path: 'assets', element: <Navigate to="/asset-health" replace /> },
    { path: 'assets/:assetId', element: <LegacyAssetRedirect /> },
    { path: 'energy', element: <Energy /> },
    { path: 'findings', element: <Findings /> },
    { path: 'findings/:findingId', element: <FindingDetail /> },
    { path: 'work-orders', element: <WorkOrders /> },
    { path: 'verification', element: <Verification /> },
    { path: 'mv', element: <MV /> },
    { path: 'data-quality', element: <DataQuality /> },
  ] },
]);

function LegacyAssetRedirect() {
  const { assetId = '' } = useParams();
  return <Navigate to={`/asset-health/${assetId}`} replace />;
}
