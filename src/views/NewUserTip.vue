<template>

<div style="position:absolute;width:100%;height:100%;background:rgba(0, 0, 0, 0.7);top:0;left:0;overflow:hidden;z-index:100;">
      
  <div style="width:40px;height:40px;position:absolute;top:15px;right:15px;background:#fff;">
    <i style="display:block;width:40px;height:40px;font-size:40px;color:#35a696;" class="el-icon-s-operation"></i>
  </div>
  <div style="font-size:19px;color:#fff;font-weight:bold;position:absolute;right:15px;top:60px;border:1px solid #fff;border-radius:10px;padding:6px 2px 6px 10px;">
    Click here to login/logout and switch tabs.
  </div>
  

  <el-button @click="$emit('close')" type="primary" style="position:absolute;width:70%;top:60%;left:15%;">Got it</el-button>
</div>

</template>