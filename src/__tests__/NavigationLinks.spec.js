import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigaton from "../components/Navigation";

it("should display email threads link", () => {
  render(
    <BrowserRouter>
      <Navigaton />
    </BrowserRouter>
  );
  const emailLinkElement = screen.getByText(/Email Threads/);
  expect(emailLinkElement).toBeInTheDocument();
});

it("should display saved email link", () => {
  render(
    <BrowserRouter>
      <Navigaton />
    </BrowserRouter>
  );
  const emailLinkElement = screen.getByText(/Saved Emails/i);
  expect(emailLinkElement).toBeInTheDocument();
});

it("should display settings link", () => {
  render(
    <BrowserRouter>
      <Navigaton />
    </BrowserRouter>
  );
  const emailLinkElement = screen.getByText(/Settings/i);
  expect(emailLinkElement).toBeInTheDocument();
});
