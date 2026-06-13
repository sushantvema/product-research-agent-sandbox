-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

vim.opt.foldmethod = "manual"
vim.diagnostic.enable(true)
vim.opt.spell = false
if vim.fn.executable("bash") == 1 then
  vim.opt.shell = vim.fn.exepath("bash")
end
vim.opt.wrap = true
vim.opt.linebreak = true

vim.api.nvim_create_autocmd("FileType", {
  pattern = "*",
  callback = function()
    vim.opt_local.formatoptions:remove({ "c", "r", "o" })
  end,
})

vim.opt.tabstop = 4 -- render tabs as 4 spaces wide

vim.g.lazyvim_ts_lsp = "tsgo"
