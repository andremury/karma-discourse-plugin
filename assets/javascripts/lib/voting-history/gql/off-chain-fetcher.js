import gql from "./fetcher";
import { history, proposal as proposalQuery } from "./queries";
import { parseMdLink } from "../../parse-md-link";

const subgraphUrl = new URL("https://hub.snapshot.org/graphql");

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
function parseVotes(votes = []) {
  const array = [];

  votes.forEach((vote) => {
    const { proposal } = vote;
    array.push({
      voteMethod: "Off-chain",
      proposal: parseMdLink(proposal?.title),
      choice: Array.isArray(vote.choice)
        ? "Multiple"
        : proposal.choices[vote.choice - 1],
      executed: moment.unix(proposal.end).format("MMMM D, YYYY"),
    });
  });

  return array;
}

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
export async function fetchOffChainProposalVotes(
  daoNames = [],
  address = "",
  amount = 3
) {
  try {
    const votesQuery = history.offChain.votes(address, daoNames, amount);
    const { votes } = await gql.query(subgraphUrl, votesQuery);

    if (votes && Array.isArray(votes)) {
      return parseVotes(votes);
    }
    return [];
  } catch (error) {
    throw error;
    //
  }
}

const parseProposals = (proposals = []) =>
  proposals.map((proposal) => ({
    type: "Off-chain",
    title: parseMdLink(proposal.title),
    voteCount: proposal.votes,
    endsAt: moment.unix(proposal.endsAt).format("MMMM D, YYYY"),
    dateDescription:
      Date.now() / 1000 > +proposal.endsAt
        ? `${moment().diff(moment.unix(proposal.endsAt), "days")} days ago`
        : 0,
  }));

export async function fetchActiveOffChainProposals(daoNames, daysAgo) {
  try {
    const proposalsQuery = proposalQuery.offChain.proposal(
      daoNames,
      undefined,
      daysAgo
    );
    const { proposals } = await gql.query(subgraphUrl, proposalsQuery);
    if (proposals && Array.isArray(proposals)) {
      return parseProposals(proposals);
    }
    return [];
  } catch (error) {
    throw error;
    //
  }
}