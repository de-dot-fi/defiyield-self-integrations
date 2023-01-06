export async function accountAssets(axios: any, stakeAddress: string) {
  const body = { ['_stake_addresses']: [stakeAddress] };
  const { data } = await axios.post('https://api.koios.rest/api/v0/account_assets', body);
  return data[0];
}
