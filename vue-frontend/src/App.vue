<template>
  <div id="app-container">
    <header>
      <h1>Proxy List</h1>
    </header>

    <section id="controls">
      <button @click="manualRefresh" :disabled="isLoading">
        <span v-if="isLoading">Refreshing...</span>
        <span v-else>Refresh Now</span>
      </button>
      <div class="auto-refresh-toggle">
        <input type="checkbox" id="auto-refresh" v-model="autoRefreshEnabled" />
        <label for="auto-refresh">Enable Auto-Refresh (every 30 seconds)</label>
      </div>
    </section>

    <section id="status-info">
      <p v-if="lastUpdated">Last Updated: {{ lastUpdated }}</p>
      <p>Showing {{ paginatedProxies.length }} of {{ filteredProxies.length }} (Total: {{ proxies.length }})</p>
    </section>

    <section id="filter-controls">
      <div class="filter-group">
        <input type="text" v-model.trim="searchTerm" placeholder="Search IP or Region..." class="search-input"/>
      </div>
      <div class="filter-group">
        <label for="region-filter">Region:</label>
        <select id="region-filter" v-model="selectedRegion">
          <option value="">All Regions</option>
          <option v-for="region in uniqueRegions" :key="region" :value="region">
            {{ region }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="type-filter">Type:</label>
        <select id="type-filter" v-model="selectedType">
          <option value="">All Types</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="filter-group">
         <button @click="exportToCSV" class="export-button" :disabled="filteredProxies.length === 0">Export CSV</button>
      </div>
    </section>

    <section id="proxy-data">
      <div v-if="isLoading && proxies.length === 0" class="loading-message">
        Loading proxies...
      </div>
      <div v-else-if="error" class="error-message">
        Error fetching proxies: {{ error }}
      </div>
      <div v-else-if="proxies.length > 0 && filteredProxies.length === 0" class="no-proxies-message">
        No proxies match your current filters.
      </div>
      <div v-else-if="proxies.length === 0 && !isLoading" class="no-proxies-message">
        No proxies available.
      </div>
      <table v-else-if="filteredProxies.length > 0" class="proxy-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Port</th>
            <th>Type</th>
            <th>HTTPS</th>
            <th>Region</th>
            <th>Last Checked</th>
            <th>Validated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proxy in paginatedProxies" :key="`${proxy.ip}:${proxy.port}`" :class="getRowClass(proxy)">
            <td>{{ proxy.ip }}</td>
            <td>{{ proxy.port }}</td>
            <td>{{ proxy.type }}</td>
            <td>{{ proxy.https }}</td>
            <td>{{ proxy.region }}</td>
            <td>{{ formatLastCheck(proxy.last_check) }}</td>
            <td :class="proxy.validated ? 'status-validated' : 'status-not-validated'">
              {{ proxy.validated ? 'Yes' : 'No' }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section id="pagination-controls" v-if="filteredProxies.length > pageSize">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const proxies = ref([]);
const isLoading = ref(false);
const error = ref(null);
const lastUpdated = ref('');
const autoRefreshEnabled = ref(true);
const autoRefreshIntervalId = ref(null);

// New state for filtering, pagination
const searchTerm = ref('');
const selectedRegion = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const pageSize = ref(20); // Display 20 proxies per page

const AUTO_REFRESH_DELAY = 30000; // 30 seconds

async function fetchProxies() {
  // Removed condition that skipped fetch if isLoading and proxies.length > 0 to allow refresh even if table is populated.
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetch('/proxies.json?t=' + Date.now()); // Cache buster
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`HTTP error ${response.status}: ${errorData?.message || response.statusText}`);
    }
    const data = await response.json();
    proxies.value = Array.isArray(data) ? data : [];
    lastUpdated.value = new Date().toLocaleString();
    // Sorting is now handled by filteredProxies if needed, or can be done here.
    // For simplicity, let's keep initial sort here.
     proxies.value.sort((a, b) => {
        if (a.validated === b.validated) {
            return new Date(b.last_check) - new Date(a.last_check);
        }
        return a.validated ? -1 : 1;
    });
  } catch (e) {
    error.value = e.message;
    console.error('Error fetching proxies:', e);
  } finally {
    isLoading.value = false;
  }
}

// --- Filtering Logic ---
const uniqueRegions = computed(() => {
  const regions = new Set(proxies.value.map(p => p.region).filter(r => r && r !== '未检测'));
  return Array.from(regions).sort();
});

const uniqueTypes = computed(() => {
  const types = new Set(proxies.value.map(p => p.type).filter(t => t && t !== '未知'));
  return Array.from(types).sort();
});

const filteredProxies = computed(() => {
  let result = proxies.value;

  // Search term filter (IP or Region)
  if (searchTerm.value) {
    const lowerSearchTerm = searchTerm.value.toLowerCase();
    result = result.filter(p =>
      p.ip.toLowerCase().includes(lowerSearchTerm) ||
      (p.region && p.region.toLowerCase().includes(lowerSearchTerm))
    );
  }

  // Region filter
  if (selectedRegion.value) {
    result = result.filter(p => p.region === selectedRegion.value);
  }

  // Type filter
  if (selectedType.value) {
    result = result.filter(p => p.type === selectedType.value);
  }
  
  // Reset to page 1 when filters change
  // Note: This can cause a flicker if not handled carefully.
  // A watcher on filter criteria might be better for this.
  // For now, this is a simple approach. The watcher approach is more robust.
  // currentPage.value = 1; // Moved to watchers

  return result; // Sorting is already applied in fetchProxies or could be re-applied here if needed
});

// Watchers to reset current page when filters change
watch([searchTerm, selectedRegion, selectedType], () => {
  currentPage.value = 1;
});


// --- Pagination Logic ---
const totalPages = computed(() => {
  return Math.ceil(filteredProxies.value.length / pageSize.value);
});

const paginatedProxies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProxies.value.slice(start, end);
});

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// --- CSV Export ---
function exportToCSV() {
  const headers = ['IP', 'Port', 'Type', 'HTTPS', 'Region', 'Last Checked', 'Validated'];
  const rows = filteredProxies.value.map(proxy => [
    proxy.ip,
    proxy.port,
    proxy.type,
    proxy.https,
    proxy.region,
    formatLastCheck(proxy.last_check), // Use formatted date
    proxy.validated ? 'Yes' : 'No'
  ]);

  let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
    + rows.map(e => e.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "proxies_export_" + new Date().toISOString().slice(0,10) + ".csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
}


// --- Existing Auto-Refresh and Lifecycle ---
function manualRefresh() {
  if (autoRefreshIntervalId.value) {
    stopAutoRefresh();
  }
  fetchProxies().finally(() => {
    if (autoRefreshEnabled.value) {
      startAutoRefresh();
    }
  });
}

function startAutoRefresh() {
  if (autoRefreshIntervalId.value) {
    clearInterval(autoRefreshIntervalId.value);
  }
  autoRefreshIntervalId.value = setInterval(fetchProxies, AUTO_REFRESH_DELAY);
  console.log('Auto-refresh started with ID:', autoRefreshIntervalId.value);
}

function stopAutoRefresh() {
  if (autoRefreshIntervalId.value) {
    clearInterval(autoRefreshIntervalId.value);
    autoRefreshIntervalId.value = null;
    console.log('Auto-refresh stopped.');
  }
}

watch(autoRefreshEnabled, (newValue) => {
  if (newValue) {
    fetchProxies();
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

onMounted(() => {
  fetchProxies();
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

function formatLastCheck(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    return dateString;
  }
}

function getRowClass(proxy) {
  if (!proxy.validated) {
    return 'row-warning';
  }
  if (proxy.https === '支持') {
    return 'row-success';
  }
  return 'row-secondary';
}

</script>

<style scoped>
#app-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

header h1 {
  color: #42b983; /* Vue green */
}

#controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

#controls button {
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

#controls button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

#controls button:hover:not(:disabled) {
  background-color: #36a476;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
}

.auto-refresh-toggle input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.auto-refresh-toggle label {
  font-size: 0.9em;
  color: #555;
}


#status-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #eef;
  border-radius: 8px;
  font-size: 0.9em;
  color: #555;
  text-align: left;
}

#filter-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 0.9em;
  color: #333;
}

.filter-group input[type="text"],
.filter-group select {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
}

.search-input {
  min-width: 200px;
}

.export-button {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
}
.export-button:disabled {
  background-color: #aaa;
}
.export-button:hover:not(:disabled) {
  background-color: #0056b3;
}


.loading-message,
.error-message,
.no-proxies-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  border-radius: 5px;
  margin-top: 20px;
}

.loading-message {
  color: #2c3e50;
}

.error-message {
  color: #d9534f; /* Red */
  background-color: #f2dede;
  border: 1px solid #ebccd1;
}

.no-proxies-message {
  color: #888;
}

.proxy-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.proxy-table th,
.proxy-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  font-size: 0.9em;
}

.proxy-table th {
  background-color: #f2f2f2;
  color: #333;
  font-weight: bold;
}

.proxy-table tbody tr:nth-child(even) {
  /* background-color: #f9f9f9; Keeping this for non-conditional rows if needed */
}

.proxy-table tbody tr:hover {
  background-color: #f1f1f1 !important; /* Ensure hover has precedence */
}

/* Row specific styles based on proxy properties */
.row-success {
  background-color: #dff0d8 !important; /* Light green for HTTPS support */
  color: #3c763d;
}
.row-warning {
  background-color: #fcf8e3 !important; /* Light yellow for not validated */
  color: #8a6d3b;
}
.row-secondary {
  background-color: #e9ecef !important; /* Light gray for validated but no HTTPS */
  color: #383d41;
}

.status-validated {
  color: green;
  font-weight: bold;
}
.status-not-validated {
  color: orange;
  font-weight: bold;
}

#pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

#pagination-controls button {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#pagination-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

#pagination-controls button:hover:not(:disabled) {
  background-color: #36a476;
}

#pagination-controls span {
  font-size: 0.9em;
  color: #555;
}

</style>
