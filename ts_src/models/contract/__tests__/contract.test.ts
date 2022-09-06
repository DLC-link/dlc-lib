import { computeContractId } from '../acceptedContract'

describe('contract tests', () => {
  it('should properly compute a contract id', () => {
    const expected =
      '81db60dcbef10a2d0cb92cb78400a96ee6a9b6da785d0230bdabf1e18a2d6ffb'
    const actual = computeContractId(
      'a3f942fe9cd3280f2e9b0e95a6228b4cc48b94f85a7f20129f89d3c3a80f4dd8',
      1,
      '2222222222222222222222222222222222222222222222222222222222222222'
    )
    expect(expected).toEqual(actual)
  })
})
