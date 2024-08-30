// interface TelegramOperationResponse {
//   message: string;
// }

// type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// type OperationRunResponse = MakeRequired<
//   {
//     type: string;
//   },
//   'type'
// >;

// type OperationResponseMethod<T extends OperationRunResponse = OperationRunResponse> = (
//   args: T,
// ) => TelegramOperationResponse;

// class Test<T extends OperationRunResponse = OperationRunResponse> {
//   constructor(readonly test: Record<string, OperationResponseMethod<T>>) {}
// }

// class NewTest extends Test<SomeType> {
//   constructor() {
//     super({ someValue: newMeds });
//   }
// }

// interface SomeTypeA extends OperationRunResponse {
//   type: string;
//   efg: string;
// }

// interface SomeTypeB extends OperationRunResponse {
//   type: string;
//   bcd: string;
// }

// type SomeType = SomeTypeA | SomeTypeB;

// const newMeds: OperationResponseMethod<SomeTypeA> = (abc: SomeTypeA): TelegramOperationResponse => {
//   return {
//     message: 'hello',
//   };
// };

abstract class SomeT {
  constructor() {}
}

class SomeB extends SomeT {
  constructor() {
    super();
  }
}

type Test = Record<string, new (args?: any) => SomeT>;

const a: Test = {
  abc: SomeB,
};

new a['abc']();
