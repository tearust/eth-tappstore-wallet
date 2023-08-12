<template>
<section class="t-footer bg_2 js_footer">
  <div class="c-m" style="width:1080px;margin:0 auto; position:releative;">

  

    
    
    <!-- <el-divider></el-divider> -->
    <p style="margin:0 auto;text-align:center;font-size:16px;">Copyright © 2019-2023 <b>TeaProject.org</b> All Rights Reserved</p>
  </div>
</section>

</template>

<script>
import {mapGetters, mapState} from 'vuex';
export default {
  computed: {

  },
  data(){
    return {

    };
  },
  async mounted(){
    
  },

}
</script>
<style lang="scss">
.t-footer{
  padding: 24px 0 40px;
  // position: fixed;
  // width: 100%;
  // bottom: 0;
  background: rgb(53, 166, 150);

  *{
    color: #fff;
  }

  .t-h{
    margin: 0 0 20px 0;
    text-align: left;
    font-size: 21px;
  }
  .t-a{
    font-size: 19px;
    display: table;
    &:hover{
      color: #ec7259;
    }
  }

  .tlg{
    position: absolute;
    top: -30px;
    right: 0;
    width: 500px;
    text-align: right;
  }

  b.lg{
    display: flex;
    justify-content: space-between;
    width: auto;
    font-size: 19px;
    font-weight: normal;

    span{
      width:150px;
      display: inline-block;
      text-align: right;
    }
    b{
      display: inline-flex;
      margin-left: 12px;
      flex: 1;
      display: inline-block;
      text-align: right;
    }
  }
}
@media screen and (max-width : 600px) {
  .t-footer{
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>