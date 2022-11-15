<script setup lang="ts">

</script>

<template>
  <footer class="footer w-full">
    <div class="content-block flex justify-end py-6">
      <a href="#" class="uppercase text-base">About More</a>
    </div>
  </footer>
</template>

<style lang="postcss">
  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: white;

    &:before {
      content: '';
      height: 100%;
      width: 100%;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transform: rotate(180deg);
      position: absolute;
      top: 0;
      left: 0;
    }
  }
</style>
