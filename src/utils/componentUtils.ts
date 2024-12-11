import { nextTick } from 'vue';

export const scrollToFirstError = async (): Promise<void> => {
  await nextTick(() => {
    const firstErrorElement = document
      .getElementsByClassName('error-label')
      .item(0);
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};
