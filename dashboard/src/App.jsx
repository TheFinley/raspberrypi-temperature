import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardHeader from './components/DashboardHeader.jsx'
import MetricsGrid from './components/MetricsGrid.jsx'
import MetricCard from './components/MetricCard.jsx'
import AnalyticsContainer from './components/AnalyticsContainer.jsx'
import TelemetryChart from './components/TelemetryChart.jsx'
import { useTelemetry } from './hooks/useTelemetry.js'

function getTempStatus(temp) {
  if (temp > 30) return 'critical'
  if (temp > 27) return 'warning'
  return 'nominal'
}

function timeSince(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr.replace(/\//g, '-').replace(' ', 'T'))
  const mins = Math.round((Date.now() - d) / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  return `${mins} mins ago`
}

function App() {
  const {
    currentTemp,
    lastUpdated,
    chartLabels,
    chartValues,
    syncStatus,
    errorMessage,
  } = useTelemetry()

  const isFirstLoad = currentTemp === null

  if (isFirstLoad && syncStatus === 'fetching') {
    return <div className="app-loading">Loading telemetry…</div>
  }
  if (isFirstLoad && syncStatus === 'error') {
    return <div className="app-error">Failed to load telemetry — {errorMessage}</div>
  }

  const [datePart, timePart] = (lastUpdated || '').split(' ')
  const syncCardStatus = syncStatus === 'error' ? 'critical'
                       : syncStatus === 'fetching' ? 'warning'
                       : 'nominal'

  return (
    <DashboardLayout>
      <DashboardHeader />
      <MetricsGrid>
        <MetricCard
          title="Ambient Temperature"
          value={currentTemp?.toFixed(2)}
          unit="°C"
          subtitle={`Last recorded ${timeSince(lastUpdated)}`}
          status={getTempStatus(currentTemp)}
        />
        <MetricCard
          title="Last Sync"
          value={timePart}
          unit=""
          subtitle={datePart}
          status={syncCardStatus}
        />
      </MetricsGrid>
      <AnalyticsContainer>
        <TelemetryChart labels={chartLabels} dataPoints={chartValues} />
      </AnalyticsContainer>
    </DashboardLayout>
  )
}

export default App
