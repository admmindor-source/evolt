Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          acao: string
          created_at: string
          entidade: string | null
          entidade_id: string | null
          id: number
          ip: unknown
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: number
          ip?: unknown
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: number
          ip?: unknown
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_lancamentos: {
        Row: {
          base_centavos: number
          beneficiario_id: string
          ciclo_ref: string
          created_at: string
          id: string
          meta: Json | null
          nivel: number | null
          origem_user_id: string | null
          pedido_id: string | null
          percentual: number
          status: Database["public"]["Enums"]["lancamento_status"]
          tipo: Database["public"]["Enums"]["bonus_tipo"]
          valor_centavos: number
        }
        Insert: {
          base_centavos: number
          beneficiario_id: string
          ciclo_ref: string
          created_at?: string
          id?: string
          meta?: Json | null
          nivel?: number | null
          origem_user_id?: string | null
          pedido_id?: string | null
          percentual: number
          status?: Database["public"]["Enums"]["lancamento_status"]
          tipo: Database["public"]["Enums"]["bonus_tipo"]
          valor_centavos: number
        }
        Update: {
          base_centavos?: number
          beneficiario_id?: string
          ciclo_ref?: string
          created_at?: string
          id?: string
          meta?: Json | null
          nivel?: number | null
          origem_user_id?: string | null
          pedido_id?: string | null
          percentual?: number
          status?: Database["public"]["Enums"]["lancamento_status"]
          tipo?: Database["public"]["Enums"]["bonus_tipo"]
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "bonus_lancamentos_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_lancamentos_ciclo_ref_fkey"
            columns: ["ciclo_ref"]
            isOneToOne: false
            referencedRelation: "ciclos"
            referencedColumns: ["ref_mes"]
          },
          {
            foreignKeyName: "bonus_lancamentos_origem_user_id_fkey"
            columns: ["origem_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_lancamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      carteira: {
        Row: {
          atualizado_em: string
          saldo_liberado_centavos: number
          saldo_provisionado_centavos: number
          total_recebido_centavos: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          saldo_liberado_centavos?: number
          saldo_provisionado_centavos?: number
          total_recebido_centavos?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          saldo_liberado_centavos?: number
          saldo_provisionado_centavos?: number
          total_recebido_centavos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carteira_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ciclos: {
        Row: {
          aberto_em: string
          fechado_em: string | null
          log: Json | null
          ref_mes: string
          status: Database["public"]["Enums"]["ciclo_status"]
          total_bonus_centavos: number
        }
        Insert: {
          aberto_em?: string
          fechado_em?: string | null
          log?: Json | null
          ref_mes: string
          status?: Database["public"]["Enums"]["ciclo_status"]
          total_bonus_centavos?: number
        }
        Update: {
          aberto_em?: string
          fechado_em?: string | null
          log?: Json | null
          ref_mes?: string
          status?: Database["public"]["Enums"]["ciclo_status"]
          total_bonus_centavos?: number
        }
        Relationships: []
      }
      documentos: {
        Row: {
          created_at: string
          id: string
          mime: string | null
          observacao: string | null
          revisor_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime?: string | null
          observacao?: string | null
          revisor_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime?: string | null
          observacao?: string | null
          revisor_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_revisor_id_fkey"
            columns: ["revisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      param_bonus_niveis: {
        Row: {
          nivel: number
          percentual: number
          tipo: Database["public"]["Enums"]["bonus_tipo"]
        }
        Insert: {
          nivel: number
          percentual: number
          tipo: Database["public"]["Enums"]["bonus_tipo"]
        }
        Update: {
          nivel?: number
          percentual?: number
          tipo?: Database["public"]["Enums"]["bonus_tipo"]
        }
        Relationships: []
      }
      param_graduacoes: {
        Row: {
          apm_requerido: number
          equiparacao_pct: number
          graduacao: Database["public"]["Enums"]["graduacao"]
          pg_requerido: number
          vml_percentual: number
        }
        Insert: {
          apm_requerido: number
          equiparacao_pct: number
          graduacao: Database["public"]["Enums"]["graduacao"]
          pg_requerido: number
          vml_percentual: number
        }
        Update: {
          apm_requerido?: number
          equiparacao_pct?: number
          graduacao?: Database["public"]["Enums"]["graduacao"]
          pg_requerido?: number
          vml_percentual?: number
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          ciclo_ref: string | null
          created_at: string
          gateway_ref: string | null
          id: string
          kit: Database["public"]["Enums"]["kit_tipo"] | null
          meta: Json | null
          pago_em: string | null
          pontos_bonificaveis: number
          pontos_graduacao: number
          status: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          user_id: string
          valor_centavos: number
        }
        Insert: {
          ciclo_ref?: string | null
          created_at?: string
          gateway_ref?: string | null
          id?: string
          kit?: Database["public"]["Enums"]["kit_tipo"] | null
          meta?: Json | null
          pago_em?: string | null
          pontos_bonificaveis?: number
          pontos_graduacao?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          user_id: string
          valor_centavos: number
        }
        Update: {
          ciclo_ref?: string | null
          created_at?: string
          gateway_ref?: string | null
          id?: string
          kit?: Database["public"]["Enums"]["kit_tipo"] | null
          meta?: Json | null
          pago_em?: string | null
          pontos_bonificaveis?: number
          pontos_graduacao?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo?: Database["public"]["Enums"]["pedido_tipo"]
          user_id?: string
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pontos_movimento: {
        Row: {
          ciclo_ref: string
          created_at: string
          id: string
          origem: string | null
          pb: number
          pedido_id: string | null
          pg: number
          user_id: string
        }
        Insert: {
          ciclo_ref: string
          created_at?: string
          id?: string
          origem?: string | null
          pb?: number
          pedido_id?: string | null
          pg?: number
          user_id: string
        }
        Update: {
          ciclo_ref?: string
          created_at?: string
          id?: string
          origem?: string | null
          pb?: number
          pedido_id?: string | null
          pg?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontos_movimento_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontos_movimento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_activations: {
        Row: {
          activated_at: string
          campaign: string | null
          id: string
          sku: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          campaign?: string | null
          id?: string
          sku: string
          user_id: string
        }
        Update: {
          activated_at?: string
          campaign?: string | null
          id?: string
          sku?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_activations_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          manual_code: string
          name: string
          price_brl: number | null
          sku: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description: string
          manual_code: string
          name: string
          price_brl?: number | null
          sku: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          manual_code?: string
          name?: string
          price_brl?: number | null
          sku?: string
        }
        Relationships: []
      }
      qualificacoes: {
        Row: {
          apm_requerido: number
          ativo: boolean
          ciclo_ref: string
          detalhes: Json | null
          graduacao: Database["public"]["Enums"]["graduacao"]
          maior_linha_pb: number
          pb_grupo_qualificado: number
          pb_grupo_total: number
          pb_pessoal: number
          user_id: string
          vml_percentual: number | null
        }
        Insert: {
          apm_requerido: number
          ativo: boolean
          ciclo_ref: string
          detalhes?: Json | null
          graduacao?: Database["public"]["Enums"]["graduacao"]
          maior_linha_pb?: number
          pb_grupo_qualificado?: number
          pb_grupo_total?: number
          pb_pessoal?: number
          user_id: string
          vml_percentual?: number | null
        }
        Update: {
          apm_requerido?: number
          ativo?: boolean
          ciclo_ref?: string
          detalhes?: Json | null
          graduacao?: Database["public"]["Enums"]["graduacao"]
          maior_linha_pb?: number
          pb_grupo_qualificado?: number
          pb_grupo_total?: number
          pb_pessoal?: number
          user_id?: string
          vml_percentual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qualificacoes_ciclo_ref_fkey"
            columns: ["ciclo_ref"]
            isOneToOne: false
            referencedRelation: "ciclos"
            referencedColumns: ["ref_mes"]
          },
          {
            foreignKeyName: "qualificacoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      remessas_pagamento: {
        Row: {
          aprovado_por: string | null
          arquivo_url: string | null
          ciclo_ref: string | null
          gerado_em: string
          id: string
          qtd_saques: number | null
          total_centavos: number | null
        }
        Insert: {
          aprovado_por?: string | null
          arquivo_url?: string | null
          ciclo_ref?: string | null
          gerado_em?: string
          id?: string
          qtd_saques?: number | null
          total_centavos?: number | null
        }
        Update: {
          aprovado_por?: string | null
          arquivo_url?: string | null
          ciclo_ref?: string | null
          gerado_em?: string
          id?: string
          qtd_saques?: number | null
          total_centavos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "remessas_pagamento_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saques: {
        Row: {
          id: string
          observacao: string | null
          pix_chave: string | null
          pix_tipo: string | null
          processado_em: string | null
          remessa_id: string | null
          solicitado_em: string
          status: Database["public"]["Enums"]["saque_status"]
          taxa_centavos: number
          user_id: string
          valor_centavos: number
          valor_liquido_centavos: number | null
        }
        Insert: {
          id?: string
          observacao?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          processado_em?: string | null
          remessa_id?: string | null
          solicitado_em?: string
          status?: Database["public"]["Enums"]["saque_status"]
          taxa_centavos?: number
          user_id: string
          valor_centavos: number
          valor_liquido_centavos?: number | null
        }
        Update: {
          id?: string
          observacao?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          processado_em?: string | null
          remessa_id?: string | null
          solicitado_em?: string
          status?: Database["public"]["Enums"]["saque_status"]
          taxa_centavos?: number
          user_id?: string
          valor_centavos?: number
          valor_liquido_centavos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saques_remessa_id_fkey"
            columns: ["remessa_id"]
            isOneToOne: false
            referencedRelation: "remessas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saques_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_initial_recs: {
        Row: {
          created_at: string
          recs: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          recs?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          recs?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          current_supplements: string[] | null
          days_per_week: number | null
          full_name: string
          goal: string | null
          height_cm: number | null
          minutes_per_day: number | null
          onboarding_completed: boolean
          profile_type: string | null
          sex: string | null
          training_level: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
          whatsapp: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          current_supplements?: string[] | null
          days_per_week?: number | null
          full_name: string
          goal?: string | null
          height_cm?: number | null
          minutes_per_day?: number | null
          onboarding_completed?: boolean
          profile_type?: string | null
          sex?: string | null
          training_level?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          whatsapp: string
        }
        Update: {
          age?: number | null
          created_at?: string
          current_supplements?: string[] | null
          days_per_week?: number | null
          full_name?: string
          goal?: string | null
          height_cm?: number | null
          minutes_per_day?: number | null
          onboarding_completed?: boolean
          profile_type?: string | null
          sex?: string | null
          training_level?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          whatsapp?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          ativo_ciclo_atual: boolean
          auth_id: string | null
          contrato_aceito_em: string | null
          contrato_hash: string | null
          contrato_ip: unknown
          contrato_user_agent: string | null
          cpf: string
          created_at: string
          email: string
          endereco: Json | null
          graduacao_ciclo_atual: Database["public"]["Enums"]["graduacao"]
          graduacao_reconhecimento: Database["public"]["Enums"]["graduacao"]
          id: string
          kit_atual: Database["public"]["Enums"]["kit_tipo"] | null
          nascimento: string | null
          nome: string
          path: unknown
          patrocinador_id: string | null
          pix_chave: string | null
          pix_tipo: string | null
          profundidade: number
          status_ativo: boolean
          telefone: string | null
          tipo: Database["public"]["Enums"]["user_tipo"]
          updated_at: string
          username: string
        }
        Insert: {
          ativo_ciclo_atual?: boolean
          auth_id?: string | null
          contrato_aceito_em?: string | null
          contrato_hash?: string | null
          contrato_ip?: unknown
          contrato_user_agent?: string | null
          cpf: string
          created_at?: string
          email: string
          endereco?: Json | null
          graduacao_ciclo_atual?: Database["public"]["Enums"]["graduacao"]
          graduacao_reconhecimento?: Database["public"]["Enums"]["graduacao"]
          id?: string
          kit_atual?: Database["public"]["Enums"]["kit_tipo"] | null
          nascimento?: string | null
          nome: string
          path?: unknown
          patrocinador_id?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          profundidade?: number
          status_ativo?: boolean
          telefone?: string | null
          tipo: Database["public"]["Enums"]["user_tipo"]
          updated_at?: string
          username: string
        }
        Update: {
          ativo_ciclo_atual?: boolean
          auth_id?: string | null
          contrato_aceito_em?: string | null
          contrato_hash?: string | null
          contrato_ip?: unknown
          contrato_user_agent?: string | null
          cpf?: string
          created_at?: string
          email?: string
          endereco?: Json | null
          graduacao_ciclo_atual?: Database["public"]["Enums"]["graduacao"]
          graduacao_reconhecimento?: Database["public"]["Enums"]["graduacao"]
          id?: string
          kit_atual?: Database["public"]["Enums"]["kit_tipo"] | null
          nascimento?: string | null
          nome?: string
          path?: unknown
          patrocinador_id?: string | null
          pix_chave?: string | null
          pix_tipo?: string | null
          profundidade?: number
          status_ativo?: boolean
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_tipo"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_patrocinador_id_fkey"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      abrir_ciclo: { Args: { ref_mes: string }; Returns: Json }
      auth_is_admin: { Args: never; Returns: boolean }
      auth_is_ei: { Args: never; Returns: boolean }
      auth_user_id: { Args: never; Returns: string }
      auth_user_path: { Args: never; Returns: unknown }
      confirmar_pagamento: {
        Args: { p_gateway_ref: string; p_pedido_id: string }
        Returns: {
          ciclo_ref: string | null
          created_at: string
          gateway_ref: string | null
          id: string
          kit: Database["public"]["Enums"]["kit_tipo"] | null
          meta: Json | null
          pago_em: string | null
          pontos_bonificaveis: number
          pontos_graduacao: number
          status: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          user_id: string
          valor_centavos: number
        }[]
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      criar_pedido: {
        Args: {
          p_kit?: string
          p_tipo: string
          p_user_id: string
          p_valor_centavos?: number
        }
        Returns: {
          ciclo_ref: string | null
          created_at: string
          gateway_ref: string | null
          id: string
          kit: Database["public"]["Enums"]["kit_tipo"] | null
          meta: Json | null
          pago_em: string | null
          pontos_bonificaveis: number
          pontos_graduacao: number
          status: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          user_id: string
          valor_centavos: number
        }[]
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fechar_ciclo: { Args: { ref_mes: string }; Returns: Json }
      get_admin_dashboard: {
        Args: { p_ciclo_ref: string }
        Returns: {
          bonus_provisionados_centavos: number
          docs_pendentes: number
          eis_ativos: number
          saques_pendentes: number
          volume_centavos: number
        }[]
      }
      get_bonus_resumo: {
        Args: { p_ciclo_ref: string; p_user_id: string }
        Returns: {
          tipo: string
          total: number
        }[]
      }
      get_documentos_user: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          observacao: string
          status: string
          storage_path: string
          tipo: string
          user_id: string
        }[]
      }
      get_financeiro_extrato: {
        Args: { p_ciclo_ref?: string; p_user_id: string }
        Returns: {
          beneficiario_id: string
          ciclo_ref: string
          created_at: string
          id: string
          meta: Json
          origem_nome: string
          origem_user_id: string
          status: string
          tipo: string
          valor_centavos: number
        }[]
      }
      get_graduacao_atual: {
        Args: { p_ciclo_ref: string; p_user_id: string }
        Returns: {
          ativo: boolean
          ciclo_ref: string
          graduacao: string
          pb_grupo_total: number
          pb_pessoal: number
          pg_atual: number
          pg_proxima: number
          proxima: string
          user_id: string
          vml_percentual: number
        }[]
      }
      get_lista_credenciamentos: {
        Args: never
        Returns: {
          cpf: string
          created_at: string
          documentos: Json
          email: string
          id: string
          kit_atual: string
          nome: string
          patrocinador_nome: string
          status_ativo: boolean
          status_docs: string
        }[]
      }
      get_pontos_extrato: {
        Args: { p_ciclo_ref?: string; p_user_id: string }
        Returns: {
          ciclo_ref: string
          created_at: string
          id: string
          origem: string
          pb: number
          pedido_id: string
          pedido_tipo: string
          pg: number
          user_id: string
        }[]
      }
      get_rede_downline: {
        Args: { p_max_depth?: number; p_path: string }
        Returns: {
          ativo_ciclo_atual: boolean
          graduacao_ciclo_atual: string
          graduacao_reconhecimento: string
          id: string
          kit_atual: string
          nivel_relativo: number
          nome: string
          parent_id: string
          path: string
          status_ativo: boolean
          tipo: string
          username: string
        }[]
      }
      get_rede_linhas: {
        Args: { p_ciclo_ref: string; p_user_id: string }
        Returns: {
          ativo_ciclo_atual: boolean
          graduacao_ciclo: string
          graduacao_reconhecimento: string
          id: string
          kit_atual: string
          nome: string
          pb_grupo: number
          pb_pessoal: number
          username: string
        }[]
      }
      get_rede_upline: {
        Args: { p_path: string }
        Returns: {
          graduacao_reconhecimento: string
          id: string
          kit_atual: string
          nome: string
          path: string
          profundidade: number
          username: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      text2ltree: { Args: { "": string }; Returns: unknown }
    }
    Enums: {
      bonus_tipo:
        | "PRIMEIRO_PEDIDO"
        | "UPGRADE"
        | "PRODUTIVIDADE"
        | "EQUIPARACAO"
      ciclo_status: "ABERTO" | "PROCESSANDO" | "FECHADO" | "ERRO"
      doc_status: "PENDENTE" | "APROVADO" | "REJEITADO"
      graduacao:
        | "NENHUMA"
        | "BRONZE"
        | "PRATA"
        | "OURO"
        | "SAFIRA"
        | "ESMERALDA"
        | "DIAMANTE"
        | "DUPLO_DIAMANTE"
        | "TRIPLO_DIAMANTE"
        | "IMPERIAL"
        | "EMBAIXADOR"
        | "EMBAIXADOR_GLOBAL"
      kit_tipo: "STANDARD" | "PREMIUM"
      lancamento_status: "PROVISIONADO" | "LIBERADO" | "PAGO" | "ESTORNADO"
      pedido_status: "PENDENTE" | "PAGO" | "CANCELADO" | "ESTORNADO"
      pedido_tipo: "KIT_INICIAL" | "UPGRADE" | "RECOMPRA"
      saque_status: "SOLICITADO" | "APROVADO" | "PAGO" | "REJEITADO"
      user_tipo: "EI" | "CLIENTE_PREFERENCIAL" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bonus_tipo: [
        "PRIMEIRO_PEDIDO",
        "UPGRADE",
        "PRODUTIVIDADE",
        "EQUIPARACAO",
      ],
      ciclo_status: ["ABERTO", "PROCESSANDO", "FECHADO", "ERRO"],
      doc_status: ["PENDENTE", "APROVADO", "REJEITADO"],
      graduacao: [
        "NENHUMA",
        "BRONZE",
        "PRATA",
        "OURO",
        "SAFIRA",
        "ESMERALDA",
        "DIAMANTE",
        "DUPLO_DIAMANTE",
        "TRIPLO_DIAMANTE",
        "IMPERIAL",
        "EMBAIXADOR",
        "EMBAIXADOR_GLOBAL",
      ],
      kit_tipo: ["STANDARD", "PREMIUM"],
      lancamento_status: ["PROVISIONADO", "LIBERADO", "PAGO", "ESTORNADO"],
      pedido_status: ["PENDENTE", "PAGO", "CANCELADO", "ESTORNADO"],
      pedido_tipo: ["KIT_INICIAL", "UPGRADE", "RECOMPRA"],
      saque_status: ["SOLICITADO", "APROVADO", "PAGO", "REJEITADO"],
      user_tipo: ["EI", "CLIENTE_PREFERENCIAL", "ADMIN"],
    },
  },
} as const
<claude-code-hint v="1" type="plugin" value="supabase@claude-plugins-official" />
