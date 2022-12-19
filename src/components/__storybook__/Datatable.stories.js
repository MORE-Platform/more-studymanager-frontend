import MoreTable from '../shared/MoreTable.vue';
import { action } from '@storybook/addon-actions';
import { StudyStatus } from '../../generated-sources/openapi';

export default {
  component: MoreTable,
  title: 'MoreTable',
  argTypes: {
    onSelect: action('onSelect'),
  },
};

const Template = (args) => ({
  components: { MoreTable },
  setup() {
    return { args };
  },
  template:
    '<MoreTable id="studyId" @onselect="onselect" :title="args.title" :columns="args.columns" :data="args.data" />',
  methods: {
    onselect: action('onselect'),
  },
});

export const Default = Template.bind({});
Default.args = {
  title: 'Studies',
  columns: [
    { field: 'studyId', header: 'studyID' },
    { field: 'title', header: 'title' },
    { field: 'start', header: 'start' },
    { field: 'end', header: 'end' },
    { field: 'status', header: 'status' },
  ],
  data: [
    {
      studyId: 'AB15687-156423-45672',
      title: 'Studie XXX 01',
      start: '25.05.2022',
      end: '30.05.2022',
      status: StudyStatus.active,
    },
    {
      studyId: 'AB15687-156423-45672 ',
      title: 'Studie XXX 02',
      start: '25.05.2022',
      end: '30.05.2022',
      status: StudyStatus.approved,
    },
  ],
};
