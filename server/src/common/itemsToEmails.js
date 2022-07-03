module.exports = function itemsToEmails(item) {
  const emails = [];

  for (const element of item) {
    emails.push(element.email);
  }

  return emails;
};
