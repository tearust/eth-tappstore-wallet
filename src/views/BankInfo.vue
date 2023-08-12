<template>
<div class="tea-page">
  <h4>Central bank</h4>
  <p>
    Click <a :href="demo_url" target="_blank">{{cn}} central bank</a> to open the demo app.
  </p>
  <br/>
  <h4>Governance</h4>
  <p>
    Click <a :href="gov_url" target="_blank">{{cn}} admin</a> to open the governance app.
  </p>

  <br/>
  <h4>Tappstore</h4>
  <p>
    Click <a :href="store_url" target="_blank">{{cn}} tappstore</a> to open the tappstore app.
  </p>
</div>
</template>
<script>
export default {
  data(){
    return {
      cn: null,
      demo_url: null,
      gov_url: null,
      store_url: null,
    };
  },
  watch: {
    '$route.params.bank': function(bank){
      this.init_info(bank);
    }
  },
  created(){
    const bank = this.$route.params.bank;
    this.init_info(bank);
  },
  methods: {
    init_info(bank){
      if(bank === 'hkd'){
        this.cn = 'Hongkong';
        this.demo_url = this.hkd('QmawoizAQhv8osuKhWvWFBSAnQoBwBC9egiN98ZEnqjj3C');
        this.gov_url = this.hkd('QmZVWC83CJygtiebH2uMDFNQEQaHyVQP46M6nAQNJfXGJG');
        this.store_url = this.hkd('QmQwo3yXqQJpnSm8SPbjxtLBh6qqJzZ1cgmESDe48zsXXv');
      }
      else if(bank === 'sgd'){
        this.cn = 'Singapore';
        this.demo_url = this.sgd('QmdyjEQdxCBCaywTbp51tPcTGbjCBdBvQQqmVGaC9RFv2e');
        this.gov_url = this.sgd('QmX2VLr8f2XwuoqWrV32VrLMkRrsWU1ooh3rZt3TK54ryg');
        this.store_url = this.sgd('QmQwo3yXqQJpnSm8SPbjxtLBh6qqJzZ1cgmESDe48zsXXv');
      }
      else if(bank === 'inr'){
        this.cn = 'India';
        this.demo_url = this.inr('QmSH2u27FV5t1JJ1yv6UNXzz7Uf9z7QhydnNqxbN7Sq3jb');
        this.gov_url = this.inr('QmQZggJWyqX682BsqDyNwHYSPtug7YAq5HsZdCQimksRBH');
        this.store_url = this.inr('QmQwo3yXqQJpnSm8SPbjxtLBh6qqJzZ1cgmESDe48zsXXv');
      }
      else{
        alert("Invalid bank name.")
      }
    },
    hkd(cid){
      return `http://hk.teaproject.org:8080/ipfs/${cid}`;
    },
    sgd(cid){
      return `http://sg.teaproject.org:8080/ipfs/${cid}`;
    },
    inr(cid){
      return `http://india.teaproject.org:8080/ipfs/${cid}`;
    }
  }
}
</script>