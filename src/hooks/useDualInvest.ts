import { useMemo, useCallback } from 'react'
import { Token } from 'constants/token'
import { useActiveWeb3React } from 'hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { calculateGasMargin } from 'utils'
import { Axios } from 'utils/axios'
import { parseBalance } from 'utils/parseAmount'
import { useDualInvestContract } from './useContract'
import { Signature, SignatureRequest, SignatureRequestClaim, SignatureResponseClaim } from 'utils/fetch/signature'

export function useDualInvestBalance(token?: Token) {
  const contract = useDualInvestContract()
  const { account } = useActiveWeb3React()
  const args = useMemo(() => [token?.address ?? '', account ?? undefined], [account, token])

  const balanceRes = useSingleCallResult(token ? contract : null, 'balances', args)

  return useMemo(() => {
    return token && balanceRes?.result ? parseBalance(balanceRes.result?.[0].toString(), token) : '-'
  }, [balanceRes.result, token])
}

export function useDualInvestCallback(): {
  depositCallback: undefined | ((val: string, tokenAddress: string) => Promise<any>)
  withdrawCallback: undefined | ((amount: string, currency: string) => Promise<any>)
  createOrderCallback:
    | undefined
    | ((
        orderId: string | number,
        productId: string,
        amount: string,
        currencyAddress: string,
        supplier: 0 | 1
      ) => Promise<any>)
  finishOrderCallback: undefined | ((orderId: string, productId: string) => Promise<any>)
  checkOrderStatusCallback: undefined | ((orderId: number) => Promise<any>)
} {
  const { account, chainId } = useActiveWeb3React()
  const contract = useDualInvestContract()

  const deposit = useCallback(
    async (val, tokenAddress): Promise<any> => {
      if (!contract) {
        throw Error('no contract')
      }
      const estimatedGas = await contract.estimateGas.deposit(val, tokenAddress).catch((error: Error) => {
        console.debug('Failed to deposit', error)
        throw error
      })
      return contract?.deposit(val, tokenAddress, { gasLimit: estimatedGas })
    },
    [contract]
  )

  const withdraw = useCallback(
    (amount: string, currency: string): Promise<any> => {
      return new Promise(async (resolve, reject) => {
        try {
          if (!contract || !account || !chainId) {
            throw Error('Failed to withdraw')
          }
          const nonce = await contract?.withdrawNonces(account)
          const signRes = await Axios.getSignatures<SignatureRequest, Signature>(
            {
              account: account,
              amount: +amount,
              chainId: chainId,
              currency: currency,
              nonce: nonce.toString()
            },
            1,
            'getWithdrawSign'
          )

          const withdrawArgs = [
            amount,
            currency,
            [signRes[0].signatory, signRes[0].signV, signRes[0].signR, signRes[0].signS]
          ]
          const estimatedGas = await contract.estimateGas.withdraw(...withdrawArgs).catch((error: Error) => {
            console.debug('Failed to create order', error)
            throw error
          })
          const contractRes = await contract?.withdraw(...withdrawArgs, { gasLimit: estimatedGas })
          resolve(contractRes)
        } catch (e) {
          reject(e)
        }
      })
    },
    [account, chainId, contract]
  )

  const checkOrderStatus = useCallback(
    async (orderId): Promise<any> => {
      if (!contract) {
        throw Error('no contract')
      }
      return contract.orders(orderId)
    },
    [contract]
  )

  const createOrder = useCallback(
    async (orderId, productId, amount, currencyAddress, supplier): Promise<any> => {
      if (!contract) return undefined
      const estimatedGas = await contract.estimateGas
        .createOrder(orderId, productId, amount, currencyAddress, supplier)
        .catch((error: Error) => {
          console.debug('Failed to create order', error)
          throw error
        })
      return contract?.createOrder(orderId, productId, amount, currencyAddress, supplier, {
        gasLimit: calculateGasMargin(estimatedGas)
      })
    },
    [contract]
  )

  const finishOrder = useCallback(
    async (orderId): Promise<any> => {
      if (!contract || !account || !chainId || !orderId) return undefined
      try {
        const signRes = await Axios.getSignatures<SignatureRequestClaim, SignatureResponseClaim>(
          {
            account: account,
            chainId: chainId,
            orderId: orderId
          },
          3,
          'getFinishOrderSign'
        )

        const { orderId: orderIdR, productId: productIdR, returnedCurrency, returnedAmount, earned, fee } = signRes[0]
        const args = [
          orderIdR + '',
          productIdR + '',
          returnedCurrency,
          returnedAmount,
          fee + '',
          [
            [signRes[0].signatory, signRes[0].signV, signRes[0].signR, signRes[0].signS],
            [signRes[1].signatory, signRes[1].signV, signRes[1].signR, signRes[1].signS],
            [signRes[2].signatory, signRes[2].signV, signRes[2].signR, signRes[2].signS]
          ]
        ]
        const estimatedGas = await contract.estimateGas.finishOrder(...args).catch((error: Error) => {
          console.debug('Failed to finish order', error)
          throw error
        })
        return new Promise((resolve, reject) => {
          contract
            ?.finishOrder(...args, {
              gasLimit: calculateGasMargin(estimatedGas)
            })
            .then((r: any) => resolve({ r, returnedCurrency, returnedAmount, earned }))
            .catch((e: any) => {
              reject(e)
            })
        })
      } catch (e) {
        throw e
      }
    },
    [account, chainId, contract]
  )

  const res = useMemo(() => {
    return {
      depositCallback: deposit,
      withdrawCallback: withdraw,
      createOrderCallback: createOrder,
      finishOrderCallback: finishOrder,
      checkOrderStatusCallback: checkOrderStatus
    }
  }, [checkOrderStatus, createOrder, deposit, finishOrder, withdraw])

  return res
}

// const getWithdrawSignature = (data: SignatureRequest) => Axios.getSignature<Signature>('getWithdrawSign', data)

// const getFinishOrderSignature = (data: SignatureRequest2) => Axios.getSignature<any>('getFinishOrderSign', data)
