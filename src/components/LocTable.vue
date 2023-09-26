<template>
  <div>
    <h3>Location Table</h3>
    <button class="btn btn-primary mb-3" style="text-align: left;" :items="items" v-show="items.some(item => item.checked)" @click="this.$emit('delLoc')">Delete Selected</button>
    <VTable
      class="table table-bordered table-striped"
      :data="items"
      :page-size="pageSize"
      v-model:currentPage="currentPage"
      @totalPagesChanged="totalPages = $event"
    >
      <template #head>
        <th>Select</th>
        <th>Place</th>
        <th>TimeZone</th>
        <th>Local Time</th>
      </template>
      <template #body="{rows}">
        <tr v-for="row in rows" :key="row.guid">
          <td><input class="form-check-input" type="checkbox" v-model="row.checked"/></td>
          <td>{{ row.locName }}</td>
          <td>{{ row.timeZoneName }}</td>
          <td>{{ row.localTimeStr }}</td>
        </tr>
      </template>
    </VTable>
    <VTPagination
      v-model:currentPage="currentPage"
      :total-pages="totalPages"
      :boundary-links="true"
    />
 </div>
</template>
  
  <script>
  export default {
    name: "LocTable",
    props: {
      items: Array,
    },
    data() {
      return {
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
      }
    },
  };
  </script>