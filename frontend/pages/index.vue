<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold mb-8">WHOIS Information</h1>

    <div class="w-full max-w-2xl">
      <div class="flex mb-4">
        <input
          type="text"
          v-model="domain"
          placeholder="Enter domain name"
          class="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="getWhoisInfo"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-r-lg transition duration-200"
        >
          Lookup
        </button>
      </div>

      <div class="flex justify-center space-x-6 mb-6">
        <label class="inline-flex items-center">
          <input type="radio" v-model="type" value="domain" class="form-radio text-blue-500">
          <span class="ml-2">Domain Information</span>
        </label>
        <label class="inline-flex items-center">
          <input type="radio" v-model="type" value="contact" class="form-radio text-blue-500">
          <span class="ml-2">Contact Information</span>
        </label>
      </div>
    </div>

    <div v-if="errorMsg" class="text-red-500 mt-4">{{ errorMsg }}</div>

    <div v-if="whoisInfo" class="mt-8 w-full max-w-5xl bg-white shadow-md rounded-lg overflow-hidden">
      <h2 class="text-2xl font-bold bg-gray-200 px-6 py-3">{{ getTableTitle() }}</h2>
      <div class="p-6 overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th v-for="(_, key) in whoisInfo" :key="key" class="border bg-gray-100 px-4 py-2 text-left">{{ formatKey(key) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="(value, key) in whoisInfo" :key="key" class="border px-4 py-2">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      domain: '',
      type: 'domain',
      whoisInfo: null,
      errorMsg: null
    }
  },
  methods: {
    async getWhoisInfo() {
      this.errorMsg = null
      this.whoisInfo = null

      try {
        const response = await fetch(
          `http://localhost:3000/whois-info?domain=${this.domain}&type=${this.type}`,
        )
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error)
        }
        this.whoisInfo = this.type === 'domain' ? data.domainInfo : data.contactInfo
      } catch (error) {
        this.errorMsg = error.message
      }
    },
    formatKey(key) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()
    },
    getTableTitle() {
      return this.type === 'domain' ? 'Domain Information' : 'Contact Information'
    }
  },
}
</script>