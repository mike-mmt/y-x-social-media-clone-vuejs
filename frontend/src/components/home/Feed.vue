<script setup lang="ts">
import type {Feeds} from "../../enums/feeds.enum.ts";
defineProps<{ feed: Feeds; }>();

</script>

<template>
<div class="feed">
</div>
</template>

<style scoped>
.feed {
  width: 100%;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #747bff;
}
</style>