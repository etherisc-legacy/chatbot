module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "192.168.178.12",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
