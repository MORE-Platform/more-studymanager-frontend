/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  defineProps({
    warningMsg: {
      type: String,
      required: true,
    },
    confirmMsg: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });
</script>

<template>
  <div class="mb-8 mt-10 px-14">
    <div class="grid grid-cols-12 place-items-center gap-4">
      <div class="col-span-2">
        <svg
          id="exclamation"
          class="w-full"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="61.127"
          height="54"
          viewBox="0 0 61.127 54"
        >
          <defs>
            <clipPath id="clip-path">
              <rect
                id="Rechteck_148158"
                width="61.127"
                height="54"
                fill="none"
              />
            </clipPath>
          </defs>
          <g id="Gruppe_161928" clip-path="url(#clip-path)">
            <path
              id="Pfad_1250"
              d="M60.43,46.37,34.954,2.527a5.08,5.08,0,0,0-8.782,0L.7,46.37A5.077,5.077,0,0,0,5.087,54H56.038a5.077,5.077,0,0,0,4.391-7.63M30.952,47.826H30.92a3.742,3.742,0,1,1,.032,0m3.22-12.659a1.882,1.882,0,0,1-1.886,1.828H29.62a1.886,1.886,0,0,1-1.886-1.828L27.182,17.26v-.046a1.89,1.89,0,0,1,1.886-1.9h3.814a1.891,1.891,0,0,1,1.84,1.942Z"
              transform="translate(0 0.001)"
              fill="#a37070"
            />
          </g>
        </svg>
      </div>
      <div class="col-span-10">
        <div class="mb-2">
          {{ warningMsg }}
        </div>
        <div class="font-medium text-red-600">
          {{ confirmMsg }}
        </div>
      </div>
    </div>
  </div>
</template>
