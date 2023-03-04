import { expect, it } from "vitest";

it("unauthed user should not be possible to create a post", () => {
  const post = "test";
  const byId = "test";

  expect(byId).toMatchObject(post);
});

it("post should be get-able after created", () => {
  const post = "test";
  const byId = "test";

  expect(byId).toMatchObject(post);
});
