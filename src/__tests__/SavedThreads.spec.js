import { render, screen } from "@testing-library/react";
import SavedThreads from "../modules/saved/SavedThreads";

function deleteThread() {
  // todo: implement later !
}

it("should display No Saved Email", () => {
  render(<SavedThreads deleteThread={deleteThread} />);
  const emptylistElement = screen.getByText(/No Saved Threads/);
  expect(emptylistElement).toBeInTheDocument();
});

it("should display a thread comming from mock data", () => {
  const fakeThreads = [
    { id: 0, snippet: "howdy sir Wawi", historyId: "123" },
    { id: 1, snippet: "howdy sir JM", historyId: "1234" },
  ];
  render(<SavedThreads threads={fakeThreads} deleteThread={deleteThread} />);
  const arrayElement = screen.getByText(/howdy sir Wawi/i);
  expect(arrayElement).toBeInTheDocument();
});
