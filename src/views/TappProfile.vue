<template>
<div class="tea-page">
  <h4>TApp profile</h4>

  
</div>
</template>
<script>
import { mapGetters, mapState } from 'vuex';

export default {
  data(){
    return {};
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters([
      'layer1_account'
    ]),
  },
  methods: {
    
  }
}
</script>