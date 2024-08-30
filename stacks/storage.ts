import { StackContext, Table } from 'sst/constructs';

export function Storage({ app, stack }: StackContext) {
  const table = new Table(stack, 'AxependitureTable', {
    primaryIndex: {
      partitionKey: 'pk',
      sortKey: 'sk',
    },
    fields: {
      pk: 'string',
      sk: 'string',
    },
  });

  stack.addOutputs({
    TableName: {
      exportName: `${app.stage}-AxependitureTableName`,
      value: table.tableName,
    },
  });

  return table;
}
