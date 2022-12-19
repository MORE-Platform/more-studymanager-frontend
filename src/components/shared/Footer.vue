<script setup lang="ts"></script>

<template>
  <footer class="footer w-full">
    <div class="content-block my-6 mx-24 flex justify-end">
      <a
        href="https://dhp.lbg.ac.at/more/"
        target="_blank"
        class="link text-base uppercase"
        >About More</a
      >
    </div>
  </footer>
</template>

<style lang="postcss">
  .footer {
    z-index: 1000;
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: white;
    width: 100%;

    &:before {
      content: '';
      height: 100%;
      width: 100%;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
      transform: rotate(180deg);
      position: absolute;
      top: 0;
      left: 0;
    }

    .link {
      position: relative;
      z-index: 100;
    }
  }
</style>
