---
title: "Dotfiles"
link: "https://www.github.com/mrkirby153/dotfiles"
summary: Managing dotfiles using Nix
featured: true
date: 2024-07-01
---

I have three primary devices that I use regularly (Two Arch Linux desktops, and 1 Macbook Pro). As a result, I want to ensure that most of my program's configuration files stay in sync across all of my devices.

Fortunately, there are many ways to do this ranging from simple (a simple bare git repo) to complex (declaratively managing them with Nix).

## Why Nix?

I've used a handfull of different dotfile managers and they all fall short.

The first method that I used: a [bare repo][1] was suffucient for a single machine or for multiple machines that share largely the same configuration. While you can sidestep the fact that only one copy of a file can exist in the repo at one time, there are circumstances that may warrant having multiple copies of a single configuration file (i.e. monitor layout) across different hosts.

To solve this problem, there are tools like [yadm][2], which enhance the bare repo concept with additional features like secret management or swapping out different versions of files according to certain criteria. However, this also fell short of what I wanted. I wanted a reproducable _environment_, not just a reproducable configuration, and an environment includes additional things like programs.

## Nix and Home Manager

Nix fills in the gaps where yadm lacks. Combined with [Home Manager][3], not only can I manage configuration files like I was before, but I can also manage programs, systemd units, and much more. Since there are subtile differences in my configurations between hosts (i.e. one of my desktops use `DP-0` as a primary monitor, while another one uses `HDMI-0`), I can parameterize my configuration to allow for minimal changes between hosts.

Below is a snippet of one of my configurations. View the full source on [GitHub][4]

```nix title="configuration.nix" showLineNumbers
config.aus = {
    username = "austin";
    home = "/home/austin";
    uid = 1000;

    wallpaper = {
      enable = true;
      path = ./firewatch.jpg;
    };

    dwmblocks.enable = true;

    programs = {
      screenshot.enable = true;
      scripts.enable = true;
      sxhkd.enable = true;
      git = {
        enable = true;
        sign = {
          enable = true;
          key = "90EF2AB021AB6FED";
        };
      };
      attic.enable = true;
      picom.enable = true;
      vim.enable = true;
      mail.enable = true;
    };
  };
```

### Cross-Operating System Compatibility

Recently, I've set up home manager and [nix-darwin][5] on my laptop, and with it was a challenge of adapting my configuration to support arm64. It took a minimal amount of changes to integrate (see [this][6] commit) my dotfiles with nix-darwin and deploy an environment that I'm familiar with and is consistent with the rest of my devices with a minimal amount of tweaking.

## Why not NixOS?

I've played around with NixOS, but I don't think the nix/nixpkgs approach is something I want to base my whole OS off of. While most FOSS packages can be ran without a hitch on NixOS utilizing tools like `patchelf` to update the dynamic linker path, there's the potential for a lot of tinkering to get proprietary, closed source, programms running in a NixOS environment. The fact that NixOS deviates from the FHS is both its greatest strength and its biggest weakness, and not something that I want to mess around with on a daily basis.

[1]: https://www.atlassian.com/git/tutorials/dotfiles
[2]: https://yadm.io
[3]: https://github.com/nix-community/home-manager
[4]: https://github.com/mrkirby153/dotfiles/blob/main/hosts/aus-box/configuration.nix
[5]: https://daiderd.com/nix-darwin/
[6]: https://github.com/mrkirby153/dotfiles/commit/470945a9e11c3eb575ba446ff85f00309d326457
